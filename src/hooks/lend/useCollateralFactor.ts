import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'

const COMPTROLLER_ABI = ['function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isComped)']

// Create a fallback provider
const FALLBACK_PROVIDER = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_URL)

export function useCollateralFactor(marketName: string, ctokenAddress: { [key: number]: string }) {
	const { library, chainId, active } = useWeb3React()
	const [collateralFactor, setCollateralFactor] = useState<string>('0')

	useEffect(() => {
		let mounted = true
		let retryCount = 0
		const MAX_RETRIES = 3

		const fetchCollateralFactor = async () => {
			// Use fallback provider if web3 isn't connected
			const provider = active ? library : FALLBACK_PROVIDER
			const networkId = chainId || 1 // Default to mainnet

			if (!ctokenAddress?.[networkId]) {
				console.log('Missing ctoken address for network:', networkId)
				return
			}

			try {
				const market = Config.vaults[marketName]
				if (!market?.comptroller) {
					console.log('Missing comptroller for market:', marketName)
					return
				}

				const comptroller = new ethers.Contract(market.comptroller, COMPTROLLER_ABI, provider)
				const { collateralFactorMantissa } = await comptroller.markets(ctokenAddress[networkId])

				// Just convert from mantissa (1e18) to decimal
				const factor = Number(ethers.utils.formatUnits(collateralFactorMantissa, 18))

				if (mounted) {
					setCollateralFactor(factor.toString())
				}
			} catch (error) {
				console.error('Error fetching collateral factor:', {
					error,
					marketName,
					ctokenAddress: ctokenAddress[networkId],
					retryCount,
				})

				// Retry on failure with exponential backoff
				if (retryCount < MAX_RETRIES && mounted) {
					retryCount++
					const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Max 10s delay
					setTimeout(fetchCollateralFactor, delay)
				}

				if (mounted) {
					setCollateralFactor('0')
				}
			}
		}

		fetchCollateralFactor()

		return () => {
			mounted = false
		}
	}, [library, chainId, ctokenAddress, marketName, active])

	return collateralFactor
}
