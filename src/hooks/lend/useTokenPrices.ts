import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import Config from '@/bao/lib/config'
import { useRouter } from 'next/router'

const ORACLE_ABI = ['function getUnderlyingPrice(address cToken) external view returns (uint256)']

export const useTokenPrices = () => {
	const { chainId, provider: web3Provider } = useWeb3React()
	const router = useRouter()
	const { market: marketName } = router.query
	const market = marketName ? Config.vaults[marketName as string] : null

	const fetchPrices = async () => {
		if (!chainId || !web3Provider || !market || !market.oracle[chainId]) {
			return {}
		}

		const oracle = new Contract(market.oracle[chainId], ORACLE_ABI, web3Provider)
		const prices: { [key: string]: number } = {}

		// First get ETH price from Chainlink for reference
		try {
			const ethPrice = await oracle.getUnderlyingPrice(market.assets[0].ctokenAddress[chainId])
			const formattedEthPrice = parseFloat(ethPrice.toString()) / 1e18
			console.log('ETH price from Chainlink:', formattedEthPrice)
			prices['eth'] = formattedEthPrice
		} catch (error) {
			console.error('Error fetching ETH price:', error)
		}

		console.log('Fetching prices for market:', {
			marketName,
			oracleAddress: market.oracle[chainId],
			assetsCount: market.assets.length,
		})

		// Fetch prices for all assets in the market
		await Promise.all(
			market.assets.map(async asset => {
				try {
					const rawPrice = await oracle.getUnderlyingPrice(asset.ctokenAddress[chainId])
					console.log('Raw price data:', {
						asset: asset.name,
						ctokenAddress: asset.ctokenAddress[chainId],
						oracleAddress: market.oracle[chainId],
						rawPrice: rawPrice.toString(),
						decimals: 18,
					})

					const formattedPrice = parseFloat(rawPrice.toString()) / 1e18

					// Store price by address and symbol for easier lookup
					const address = asset.underlyingAddress[chainId]?.toLowerCase() || ''
					if (address) {
						prices[address] = formattedPrice
					}

					// Store by symbol for assets like baoUSD
					const symbol = asset.symbol.toLowerCase()
					prices[symbol] = formattedPrice

					// Special case for baoUSD - always set price to 1
					if (asset.name === 'baoUSD' || symbol === 'baousd') {
						console.log('Setting baoUSD price to 1')
						prices[address] = 1
						prices['baousd'] = 1
						prices[symbol] = 1
						prices[asset.name.toLowerCase()] = 1
					}

					console.log('Price processed:', {
						asset: asset.name,
						symbol: asset.symbol,
						address,
						formattedPrice,
						rawPrice: rawPrice.toString(),
						storedPrice: prices[address],
						storedSymbolPrice: prices[symbol],
						isBaoUSD: asset.name === 'baoUSD',
						finalPrice: prices[symbol],
					})
				} catch (error) {
					console.error(`Error fetching price for ${asset.name}:`, error)
				}
			}),
		)

		console.log('Final token prices:', prices)
		return prices
	}

	const { data: tokenPrices } = useQuery(['tokenPrices', chainId, marketName], fetchPrices, {
		enabled: !!chainId && !!web3Provider && !!market,
		refetchInterval: 30000, // Refetch every 30 seconds
		staleTime: 10000, // Consider data stale after 10 seconds
	})

	return { tokenPrices: tokenPrices || {} }
}
