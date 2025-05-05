import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { VaultOracle__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall'
import { forEach } from 'lodash'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useOraclePrices = (marketName: string): { [p: string]: BigNumber } => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library
	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: prices, refetch } = useQuery({
		queryKey: ['@/hooks/lend/useOraclePrices', providerKey(library, account, chainId), { enabled, marketName }],

		queryFn: async () => {
			if (!enabled) return null

			const oracle = VaultOracle__factory.connect(Config.lendMarkets[marketName].oracle, signerOrProvider)
			const multicall = new Multicall({ ethersProvider: library, tryAggregate: true })
			const multicallContext = Config.lendMarkets[marketName].assets.map(asset => ({
				reference: asset.marketAddress[chainId],
				contractAddress: oracle.address,
				abi: VaultOracle__factory.abi,
				calls: [
					{
						reference: 'getUnderlyingPrice',
						methodName: 'getUnderlyingPrice',
						methodParameters: [asset.marketAddress[chainId]],
					},
				],
			}))

			const multicallResults = await multicall.call(multicallContext)

			return Object.fromEntries(
				Object.entries(multicallResults.results).map(([address, result]) => [
					address,
					BigNumber.from(result.callsReturnContext.find(call => call.reference === 'getUnderlyingPrice')?.returnValues[0]),
				]),
			)
		},

		enabled,
	})

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return prices
}
