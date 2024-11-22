import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { useBorrowBalances } from './useBorrowBalances'
import { useOraclePrice } from './useOraclePrice'

const useHealthFactor = (marketName: string) => {
	const { chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const [healthFactor, setHealthFactor] = useState<BigNumber>(BigNumber.from(0))

	// Get all market addresses
	const marketAddresses = market.assets.map(asset => asset.marketAddress[chainId])

	const borrowBalances = useBorrowBalances(marketName)
	const prices = useOraclePrice(marketName, marketAddresses)

	useEffect(() => {
		if (!borrowBalances || !prices || !chainId) {
			setHealthFactor(BigNumber.from(0))
			return
		}

		try {
			const marketAddress = market.marketAddresses[chainId]
			const price = prices[marketAddress]

			if (!price) {
				setHealthFactor(BigNumber.from(0))
				return
			}

			const balance = borrowBalances.find(balance => balance.address === marketAddress)?.balance || BigNumber.from(0)
			const collateralSummation = price
				.div(BigNumber.from(10).pow(36 - 18))
				.mul(balance)
				.div(BigNumber.from(10).pow(18))

			setHealthFactor(collateralSummation)
		} catch (error) {
			console.error('Error calculating health factor:', error)
			setHealthFactor(BigNumber.from(0))
		}
	}, [borrowBalances, prices, chainId, market])

	return healthFactor
}

export default useHealthFactor
