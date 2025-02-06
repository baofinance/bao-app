import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'

const ORACLE_ABI = ['function getUnderlyingPrice(address cToken) view returns (uint256)']
const ETH_PRICE_FEED_ABI = ['function latestAnswer() view returns (int256)']

interface TokenPrices {
	[key: string]: number
}

export const useTokenPrices = () => {
	const { chainId, library } = useWeb3React()

	const { data: prices = {} } = useQuery<TokenPrices>(
		['tokenPrices', chainId],
		async () => {
			if (!chainId || !library) return {}

			const results: TokenPrices = {}

			try {
				// First get ETH price from Chainlink
				const ethPriceFeedAddress = Config.contracts.wethPrice[chainId]?.address
				if (ethPriceFeedAddress) {
					try {
						const ethPriceFeed = new ethers.Contract(ethPriceFeedAddress, ETH_PRICE_FEED_ABI, library)
						const ethPrice = await ethPriceFeed.latestAnswer()
						// Chainlink ETH/USD price feed uses 8 decimals
						const formattedEthPrice = Number(ethers.utils.formatUnits(ethPrice, 8))
						results['eth'] = formattedEthPrice
						console.log('ETH price from Chainlink:', formattedEthPrice)
					} catch (err) {
						console.error('Failed to get ETH price from Chainlink:', err)
					}
				}

				// For each market in Config.vaults
				for (const [marketName, marketData] of Object.entries(Config.vaults)) {
					const oracleAddress = marketData.oracle
					if (!oracleAddress || !ethers.utils.isAddress(oracleAddress)) {
						console.log(`Invalid oracle address for market ${marketName}:`, oracleAddress)
						continue
					}

					console.log('Fetching prices for market:', {
						marketName,
						oracleAddress,
						assetsCount: marketData.assets?.length,
					})

					const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, library)

					// Get prices for each asset in the market
					for (const asset of marketData.assets) {
						const ctokenAddress = asset.ctokenAddress[chainId]
						const underlyingAddress = asset.underlyingAddress[chainId]

						if (!ctokenAddress || (!underlyingAddress && underlyingAddress !== 'eth')) {
							console.log(`Skipping ${asset.name} - invalid addresses:`, {
								ctokenAddress,
								underlyingAddress,
							})
							continue
						}

						try {
							const price = await oracle.getUnderlyingPrice(ctokenAddress)
							console.log('Raw price data:', {
								asset: asset.name,
								ctokenAddress,
								oracleAddress,
								rawPrice: price.toString(),
								decimals: asset.underlyingDecimals,
							})

							// Convert price to human readable number (assuming 18 decimals for price)
							const formattedPrice = Number(ethers.utils.formatUnits(price, 18))
							const addressKey = underlyingAddress === 'eth' ? 'eth' : underlyingAddress.toLowerCase()

							results[addressKey] = formattedPrice

							console.log('Price processed:', {
								asset: asset.name,
								address: addressKey,
								formattedPrice,
								rawPrice: price.toString(),
							})
						} catch (err) {
							console.error(`Failed to get price for ${asset.name}:`, err)
						}
					}
				}
			} catch (err) {
				console.error('Failed to fetch prices:', err)
			}

			console.log('All token prices:', results)
			return results
		},
		{
			enabled: !!chainId && !!library,
			staleTime: 30000,
			cacheTime: 60000,
		},
	)

	return prices
}
