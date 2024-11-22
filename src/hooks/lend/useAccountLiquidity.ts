import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { useSupplyBalances } from './useSupplyBalances'
import { useExchangeRates } from './useExchangeRate'
import { useOraclePrice } from './useOraclePrice'
import { decimate } from '@/utils/numberFormat'
import { Balance } from '@/bao/lib/types'

type ExchangeRates = Record<string, BigNumber>

interface AccountLiquidity {
	liquidity: BigNumber
	borrow: BigNumber
}

export const useAccountLiquidity = (marketName: string): AccountLiquidity => {
	const { chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const [liquidity, setLiquidity] = useState<BigNumber>(BigNumber.from(0))
	const [borrow, setBorrow] = useState<BigNumber>(BigNumber.from(0))

	const supplyBalances = useSupplyBalances(marketName)
	const exchangeRates = useExchangeRates(marketName) as ExchangeRates

	// Get all market addresses
	const marketAddresses = market.assets.map(asset => asset.marketAddress[chainId])
	const prices = useOraclePrice(marketName, marketAddresses)

	useEffect(() => {
		if (!supplyBalances || !exchangeRates || !prices || !chainId) {
			setLiquidity(BigNumber.from(0))
			setBorrow(BigNumber.from(0))
			return
		}

		try {
			if (Object.keys(supplyBalances).length === 0) {
				setLiquidity(BigNumber.from(0))
				setBorrow(BigNumber.from(0))
				return
			}

			const totalLiquidity = market.assets.reduce((prev, asset) => {
				const addr = asset.marketAddress[chainId]
				const price = prices[addr]
				if (!price) return prev

				const supply = supplyBalances.find(balance => balance.address === addr)
				if (!supply) return prev

				return prev.add(decimate(supply.balance.mul(exchangeRates[addr]).mul(price)))
			}, BigNumber.from(0))

			setLiquidity(totalLiquidity)
			setBorrow(totalLiquidity.mul(market.collateralFactor).div(BigNumber.from(10).pow(18)))
		} catch (error) {
			console.error('Error calculating account liquidity:', error)
			setLiquidity(BigNumber.from(0))
			setBorrow(BigNumber.from(0))
		}
	}, [supplyBalances, exchangeRates, prices, chainId, market])

	return { liquidity, borrow }
}

export default useAccountLiquidity
