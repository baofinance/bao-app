import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import MultiCall from '@/utils/multicall'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import useBao from '@/hooks/base/useBao'

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

export const useExchangeRates = (marketName: string): Record<string, BigNumber> => {
	const { library, account, chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const bao = useBao()

	const enabled = !!market && !!account && !!bao && !!chainId
	const { data: exchangeRates } = useQuery(
		['@/hooks/lend/useExchangeRates', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const contracts: Contract[] = [Ctoken__factory.connect(market.marketAddresses[chainId], library)]
			const multiCallContext = MultiCall.createCallContext(
				contracts.map(contract => ({
					ref: contract.address,
					contract: contract,
					calls: [{ method: 'exchangeRateStored' }],
				})),
			)
			const data = (await bao.multicall.call(multiCallContext)) as MultiCallResults

			return Object.keys(data.results).reduce((exchangeRate: Record<string, BigNumber>, address: string) => {
				exchangeRate[address] = data.results[address].callsReturnContext[0].returnValues[0]
				return exchangeRate
			}, {})
		},
		{
			enabled,
		},
	)

	return exchangeRates || {}
}
