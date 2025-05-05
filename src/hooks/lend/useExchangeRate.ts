import { BigNumber } from 'ethers'
import { ActiveSupportedVault } from '@/bao/lib/types'
import MultiCall from '@/utils/multicall'
import useBao from '../base/useBao'
import { useVaults } from '@/hooks/vaults/useVaults'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useEffect } from 'react'
import Config from '@/bao/lib/config'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory, Erc20__factory } from '@/typechain/factories'

type ExchangeRates = {
	exchangeRates: { [key: string]: BigNumber }
}

export const useExchangeRates = (marketName: string): ExchangeRates => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]

	const enabled = !!market && !!bao && !!account
	const { data: exchangeRates } = useQuery({
		queryKey: ['@/hooks/lend/useExchangeRates', providerKey(library, account, chainId), { enabled, marketName }],

		queryFn: async () => {
			const contracts: Contract[] = [Ctoken__factory.connect(market.marketAddresses[chainId], library)]
			const multiCallContext = MultiCall.createCallContext(
				contracts.map(contract => ({
					ref: contract.address,
					contract: contract,
					calls: [{ method: 'exchangeRateStored' }],
				})),
			)
			const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))

			return Object.keys(data).reduce(
				(exchangeRate: { [key: string]: BigNumber }, address: string) => ({
					...exchangeRate,
					[address]: data[address][0].values[0],
				}),
				{},
			)
		},

		enabled,
	})

	return {
		exchangeRates,
	}
}
