import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Comptroller__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import MultiCall from '@/utils/multicall'

interface CallReturnContext {
	reference: string
	returnValues: any[]
}

interface CallResult {
	callsReturnContext: CallReturnContext[]
}

export const useComptrollerData = (marketName: string): ComptrollerData[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: comptrollerData } = useQuery(
		['@/hooks/lend/useComptrollerData', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			if (!enabled) return null

			const comptroller = Comptroller__factory.connect(Config.lendMarkets[marketName].comptroller, signerOrProvider)
			const assets = Config.lendMarkets[marketName].assets

			const multicallContext = MultiCall.createCallContext([
				{
					ref: comptroller.address,
					contract: comptroller,
					calls: assets.map(asset => ({
						method: 'markets',
						params: [asset.marketAddress[chainId]],
						ref: asset.marketAddress[chainId],
					})),
				},
			])

			const multicallResults = await bao.multicall.call(multicallContext)
			const results = multicallResults.results[comptroller.address].callsReturnContext

			return results.map(result => ({
				address: result.reference,
				collateralFactor: BigNumber.from(result.returnValues[1]),
				imfFactor: BigNumber.from(result.returnValues[2]),
			}))
		},
		{
			enabled,
		},
	)

	return comptrollerData || []
}

type ComptrollerData = {
	address: string
	collateralFactor: BigNumber
	imfFactor: BigNumber
}
