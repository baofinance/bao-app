import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { VaultOracle__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall'
import { forEach } from 'lodash'

export const useOraclePrices = (marketName: string): { [p: string]: BigNumber } => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library
	const enabled = !!bao && !!account && !!chainId
	const { data: prices } = useQuery(
		['@/hooks/lend/useOraclePrices', providerKey(library, account, chainId), { enabled }],
		async () => {
			const multicall = new Multicall({ ethersProvider: library, tryAggregate: true })
			const multicallContext: ContractCallContext[] = []
			const oracle = VaultOracle__factory.connect(Config.lendMarkets[marketName].oracle, signerOrProvider)

			forEach(Config.lendMarkets[marketName].assets, asset => {
				multicallContext.push({
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
				})
			})

			const multicallResults: ContractCallResults = await multicall.call(multicallContext)

			return Object.keys(multicallResults.results).reduce(
				(price: { [key: string]: BigNumber }, address: string) => ({
					...price,
					[address]: multicallResults.results[address].callsReturnContext.find(call => call.reference === 'getUnderlyingPrice')
						?.returnValues[0],
				}),
				{},
			)
		},

		{
			enabled,
		},
	)

	return prices
}
