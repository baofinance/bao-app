import Config from '@/bao/lib/config'
import { Balance } from '@/bao/lib/types'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/index'
import { decimate } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useExchangeRates } from './useExchangeRate'
import { useSupplyRate } from '@/hooks/lend/useSupplyRate'
import { useOraclePrice } from '@/hooks/lend/useOraclePrice'

export type AccountLiquidity = {
	netApy: BigNumber
	usdSupply: BigNumber
	usdBorrow: BigNumber
	usdBorrowable: BigNumber
}

export const useAccountLiquidity = (marketName: string, supplyBalances: Balance[], borrowBalances: Balance[]): AccountLiquidity => {
	const { library, account, chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const { exchangeRates } = useExchangeRates(marketName)
	const price = useOraclePrice(marketName)
	const supplyRate = useSupplyRate(marketName)
	const comptroller = useContract<Comptroller>('Comptroller', market.comptroller)

	const enabled =
		!!comptroller && !!account && !!market && !!supplyBalances && !!borrowBalances && !!exchangeRates && !!price && !!supplyRate
	const { data: accountLiquidity } = useQuery(
		[
			'@/hooks/vaults/useAccountLiquidity',
			providerKey(library, account, chainId),
			{
				enabled,
				supplyBalances,
				borrowBalances,
				exchangeRates,
				price,
				marketName,
			},
		],
		async () => {
			const compAccountLiqudity = await comptroller.getAccountLiquidity(account)

			const usdSupply =
				supplyBalances && supplyBalances.length > 0
					? Object.keys(exchangeRates).reduce((prev: BigNumber, addr: string) => {
							const supply = supplyBalances.find(balance => balance.address === addr)
							if (!supply) return
							return prev.add(decimate(supply.balance.mul(exchangeRates[addr]).mul(price)))
						}, BigNumber.from(0))
					: BigNumber.from(0)

			const usdBorrow = Object.entries(borrowBalances).reduce((prev: BigNumber, [, { address, balance }]) => {
				return prev.add(balance.mul(price))
			}, BigNumber.from(0))

			const supplyApy =
				supplyBalances && supplyBalances.length > 0
					? supplyBalances
							.find(balance => balance.address === market.underlyingAddresses[chainId])
							.balance.mul(exchangeRates[market.marketAddresses[chainId]])
							.mul(price)
							.mul(supplyRate)
					: BigNumber.from(0)

			const borrowApy =
				borrowBalances && borrowBalances.length > 0
					? borrowBalances
							.find(balance => balance.address === market.marketAddresses[chainId])
							.balance.mul(price)
							.mul(supplyRate)
					: BigNumber.from(0)

			const netApy =
				supplyApy.gt(borrowApy) && !usdSupply.eq(0)
					? supplyApy.sub(borrowApy).div(usdSupply)
					: borrowApy.gt(supplyApy) && !usdBorrow.eq(0)
						? supplyApy.sub(borrowApy).div(usdBorrow)
						: BigNumber.from(0)

			return {
				netApy,
				usdSupply,
				usdBorrow,
				usdBorrowable: compAccountLiqudity[1],
			}
		},
		{
			enabled,
			placeholderData: {
				netApy: BigNumber.from(0),
				usdSupply: BigNumber.from(0),
				usdBorrow: BigNumber.from(0),
				usdBorrowable: BigNumber.from(0),
			},
		},
	)

	return accountLiquidity
}
