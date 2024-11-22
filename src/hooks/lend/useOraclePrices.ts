import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { VaultOracle__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import MultiCall from '@/utils/multicall'

interface CallReturnContext {
	reference: string
	returnValues: any[]
}

interface MultiCallResults {
	results: {
		[address: string]: {
			callsReturnContext: CallReturnContext[]
		}
	}
}

export const useOraclePrices = (marketName: string, assetAddresses?: string[]): Record<string, BigNumber> => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: prices, refetch } = useQuery(
		['@/hooks/lend/useOraclePrices', providerKey(library, account, chainId), { enabled, marketName, assetAddresses }],
		async () => {
			const oracle = VaultOracle__factory.connect(Config.lendMarkets[marketName].oracle, signerOrProvider)
			const addresses = assetAddresses || Config.lendMarkets[marketName].assets.map(asset => asset.marketAddress[chainId])

			const multicallContext = MultiCall.createCallContext([
				{
					ref: oracle.address,
					contract: oracle,
					calls: addresses.map(address => ({
						method: 'getUnderlyingPrice',
						params: [address],
					})),
				},
			])

			const multicallResults = (await bao.multicall.call(multicallContext)) as MultiCallResults

			return addresses.reduce(
				(acc, address, index) => {
					acc[address] = multicallResults.results[oracle.address].callsReturnContext[index].returnValues[0]
					return acc
				},
				{} as Record<string, BigNumber>,
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return prices || {}
}
