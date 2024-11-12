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
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export type AccountLiquidity = {
	netApy: BigNumber
	supply: BigNumber
	borrow: BigNumber
	borrowable: BigNumber
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
	const { data: accountLiquidity, refetch } = useQuery(
		[
			'@/hooks/vaults/useAccountLiquidity',
			providerKey(library, account, chainId),
			{ enabled, supplyBalances, borrowBalances, exchangeRates, price, marketName },
		],
		async () => {
			const compAccountLiquidity = await comptroller.getAccountLiquidity(account)

			const calculateSupply = () => {
				if (!supplyBalances || supplyBalances.length === 0) return BigNumber.from(0)
				return Object.keys(exchangeRates).reduce((prev, addr) => {
					const supply = supplyBalances.find(balance => balance.address === addr)
					if (!supply) return prev
					return prev.add(decimate(supply.balance.mul(exchangeRates[addr]).mul(price)))
				}, BigNumber.from(0))
			}

			const calculateBorrow = () => {
				return Object.entries(borrowBalances).reduce((prev, [, { balance }]) => {
					return prev.add(balance.mul(price))
				}, BigNumber.from(0))
			}

			const calculateApy = (balances: Balance[], rate: BigNumber, marketAddress: string) => {
				const balance = balances.find(balance => balance.address === marketAddress)
				return balance ? balance.balance.mul(price).mul(rate) : BigNumber.from(0)
			}

			const supply = calculateSupply()
			const borrow = calculateBorrow()
			const supplyApy = calculateApy(supplyBalances, supplyRate, market.marketAddresses[chainId])
			const borrowApy = calculateApy(borrowBalances, supplyRate, market.marketAddresses[chainId])

			const netApy =
				supplyApy.gt(borrowApy) && !supply.isZero()
					? supplyApy.sub(borrowApy).div(supply)
					: borrowApy.gt(supplyApy) && !borrow.isZero()
						? supplyApy.sub(borrowApy).div(borrow)
						: BigNumber.from(0)

			return {
				netApy,
				supply,
				borrow,
				borrowable: BigNumber.from(compAccountLiquidity[1]),
			}
		},
		{
			enabled,
			placeholderData: {
				netApy: BigNumber.from(0),
				supply: BigNumber.from(0),
				borrow: BigNumber.from(0),
				borrowable: BigNumber.from(0),
			},
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return accountLiquidity
}
