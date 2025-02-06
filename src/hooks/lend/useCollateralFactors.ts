import { useWeb3React } from '@web3-react/core'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'

const COMPTROLLER_ABI = ['function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isComped)']

// Create a fallback provider
const FALLBACK_PROVIDER = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_URL)

export function useCollateralFactors(marketName: string) {
	const { library, chainId, active } = useWeb3React()
	const [collateralFactors, setCollateralFactors] = useState<{ [key: string]: string }>({})

	useEffect(() => {
		let mounted = true
		let retryCount = 0
		const MAX_RETRIES = 3

		const fetchCollateralFactors = async () => {
			// Use fallback provider if web3 isn't connected
			const provider = active ? library : FALLBACK_PROVIDER
			const networkId = chainId || 1 // Default to mainnet

			const market = Config.vaults[marketName]
			if (!market?.comptroller || !market.assets) {
				console.log('Missing comptroller or assets for market:', marketName)
				return
			}

			try {
				const comptroller = new ethers.Contract(market.comptroller, COMPTROLLER_ABI, provider)
				const factors: { [key: string]: string } = {}

				// Fetch all collateral factors in parallel
				const promises = market.assets.map(async asset => {
					if (!asset.ctokenAddress?.[networkId]) return null

					try {
						const { collateralFactorMantissa } = await comptroller.markets(asset.ctokenAddress[networkId])
						const factor = Number(ethers.utils.formatUnits(collateralFactorMantissa, 18))
						return {
							address: asset.ctokenAddress[networkId].toLowerCase(),
							factor: factor.toString(),
						}
					} catch (error) {
						console.error('Error fetching collateral factor for asset:', {
							asset: asset.name,
							error,
						})
						return null
					}
				})

				const results = await Promise.all(promises)
				results.forEach(result => {
					if (result) {
						factors[result.address] = result.factor
					}
				})

				if (mounted) {
					setCollateralFactors(factors)
				}
			} catch (error) {
				console.error('Error fetching collateral factors:', {
					error,
					marketName,
					retryCount,
				})

				// Retry on failure with exponential backoff
				if (retryCount < MAX_RETRIES && mounted) {
					retryCount++
					const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Max 10s delay
					setTimeout(fetchCollateralFactors, delay)
				}
			}
		}

		fetchCollateralFactors()

		return () => {
			mounted = false
		}
	}, [library, chainId, marketName, active])

	return collateralFactors
}
