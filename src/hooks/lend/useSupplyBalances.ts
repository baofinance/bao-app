import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { Balance } from '@/bao/lib/types'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { BigNumber } from '@ethersproject/bignumber'
import { useBlockUpdater } from '@/hooks/base/useBlock'

export const useSupplyBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: balances, refetch } = useQuery(
		['@/hooks/lend/useSupplyBalances', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const tokens = market.assets.map(asset => asset.ctokenAddress[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'balanceOf', params: [account] }, { method: 'exchangeRateStored' }, { method: 'symbol' }],
						})),
					),
				),
			)

			return Object.keys(res).map(address => {
				const asset = market.assets.find(asset => asset.ctokenAddress[chainId].toLowerCase() === address.toLowerCase())
				if (!asset) throw new Error(`Asset not found for address ${address}`)

				const decimals = asset.underlyingDecimals

				const balance = res[address][0].values[0]
				const exchangeRate = res[address][1].values[0]

				// Calculate balance in underlying tokens
				const balanceUnderlying = balance.mul(exchangeRate).div(BigNumber.from(10).pow(18))

				return {
					address: asset.underlyingAddress[chainId],
					symbol: res[address][2].values[0],
					balance: balanceUnderlying,
					decimals,
				}
			})
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
		},
	)

	useBlockUpdater(refetch, 10)
	useTxReceiptUpdater(refetch)

	return balances || []
}
