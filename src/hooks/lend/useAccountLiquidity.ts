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
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'
import { useOraclePrices } from '@/hooks/lend/useOraclePrices'
import { useBorrowBalances } from '@/hooks/lend/useBorrowBalances'

export type AccountLiquidity = {
	netApy: BigNumber
	supply: BigNumber
	borrow: BigNumber
	borrowable: BigNumber
}

export const useAccountLiquidity = (marketName: string): AccountLiquidity => {
	const { library, account, chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const { exchangeRates } = useExchangeRates(marketName)
	const price = useOraclePrice(marketName)
	const prices = useOraclePrices(marketName)
	const supplyRate = useSupplyRate(marketName)
	const supplyBalances = useSupplyBalances(marketName)
	const borrowBalances = useBorrowBalances(marketName)
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
				return supplyBalances.reduce((prev, supply) => {
					if (!supply) return prev
					return prev.add(decimate(supply.balance.mul(prices[supply.address])))
				}, BigNumber.from(0))
			}

			const calculateBorrow = () => {
				if (!borrowBalances || borrowBalances.length === 0) return BigNumber.from(0)
				return borrowBalances.reduce((prev, borrow) => {
					if (!borrow) return prev
					return prev.add(borrow.balance.mul(prices[borrow.address]))
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
