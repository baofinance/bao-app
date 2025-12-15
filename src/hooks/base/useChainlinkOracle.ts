import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

// Chainlink Price Feed addresses on Ethereum mainnet
const CHAINLINK_FEEDS = {
	ETH: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // ETH/USD
	LUSD: '0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0', // LUSD/USD
	DAI: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9', // DAI/USD
}

// ABI for Chainlink Price Feed contracts
const PRICE_FEED_ABI = [
	{
		inputs: [] as any[],
		name: 'latestRoundData',
		outputs: [
			{ internalType: 'uint80', name: 'roundId', type: 'uint80' },
			{ internalType: 'int256', name: 'answer', type: 'int256' },
			{ internalType: 'uint256', name: 'startedAt', type: 'uint256' },
			{ internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
			{ internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [] as any[],
		name: 'decimals',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const

export type SupportedAsset = keyof typeof CHAINLINK_FEEDS

/**
 * Hook to fetch price data from Chainlink Oracle
 * @param assetOrAddress - Either a predefined asset key (ETH, LUSD, DAI) or a direct Chainlink price feed address
 * @param refreshInterval - How often to refresh the price in milliseconds (defaults to 60000ms / 1 minute)
 * @returns Price data with value in USD (scaled to 18 decimals) and loading state
 */
export const useChainlinkOracle = (assetOrAddress: SupportedAsset | string, refreshInterval = 60000) => {
	const { library } = useWeb3React()
	const [price, setPrice] = useState<null | string>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	// Determine if we're using a predefined asset or a custom address
	const isPredefinedAsset = Object.keys(CHAINLINK_FEEDS).includes(assetOrAddress)
	const feedAddress = isPredefinedAsset ? CHAINLINK_FEEDS[assetOrAddress as SupportedAsset] : assetOrAddress

	useEffect(() => {
		if (!library || !feedAddress) return

		const fetchPrice = async () => {
			setLoading(true)
			setError(null)

			try {
				const priceFeedContract = new Contract(feedAddress, PRICE_FEED_ABI, library)

				// Get price and decimals from the price feed
				const [, answer] = await priceFeedContract.latestRoundData()
				const decimals = await priceFeedContract.decimals()

				// Scale to 18 decimals (Chainlink typically uses 8 decimals)
				const scaleFactor = 10 ** (18 - decimals)
				const scaledPrice = answer.mul(scaleFactor)

				setPrice(scaledPrice.toString())
				setLoading(false)
			} catch (err) {
				console.error(`Error fetching price from Chainlink feed ${feedAddress}:`, err)
				setError(err as Error)
				setLoading(false)
			}
		}

		fetchPrice()

		// Set up interval for refreshing the price
		const interval = setInterval(fetchPrice, refreshInterval)

		// Clean up interval on unmount
		return () => clearInterval(interval)
	}, [feedAddress, library, refreshInterval])

	return { price, loading, error, priceAsNumber: price ? parseFloat(formatUnits(price, 18)) : null }
}

export default useChainlinkOracle
