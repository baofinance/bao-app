import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useDefiLlamaApy } from './useDefiLlamaApy'

const CTOKEN_ABI = ['function supplyRatePerBlock() view returns (uint256)']

// Ethereum block time is ~12.04 seconds
const BLOCKS_PER_DAY = (24 * 60 * 60) / 12.04
const DAYS_PER_YEAR = 365
const BLOCKS_PER_YEAR = Math.floor(BLOCKS_PER_DAY * DAYS_PER_YEAR)

// Create a fallback provider
const FALLBACK_PROVIDER = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_URL)

export const useSupplyRate = (marketName: string, ctokenAddress: any, llamaId?: string) => {
	console.log('useSupplyRate called with:', {
		marketName,
		ctokenAddress,
		llamaId,
	})

	const { library, chainId, active } = useWeb3React()
	const [supplyRate, setSupplyRate] = useState<string>('0')
	const underlyingApy = useDefiLlamaApy(llamaId)

	console.log('useSupplyRate details:', {
		marketName,
		ctokenAddress,
		llamaId,
		underlyingApy,
		chainId,
		hasLibrary: !!library,
		active,
		supplyRate,
	})

	useEffect(() => {
		let mounted = true

		const fetchSupplyRate = async () => {
			// Use fallback provider if web3 isn't connected
			const provider = active ? library : FALLBACK_PROVIDER
			const networkId = chainId || 1 // Default to mainnet

			if (!ctokenAddress[networkId]) {
				console.warn('Missing ctoken address for network:', networkId)
				return
			}

			try {
				const contract = new ethers.Contract(ctokenAddress[networkId], CTOKEN_ABI, provider)
				const supplyRatePerBlock = await contract.supplyRatePerBlock()

				// Convert to yearly rate
				const ratePerBlock = Number(formatUnits(supplyRatePerBlock, 18))
				const yearlyRate = ratePerBlock * BLOCKS_PER_YEAR * 100

				console.log('Supply rate calculation:', {
					supplyRatePerBlock: supplyRatePerBlock.toString(),
					ratePerBlock,
					yearlyRate,
					BLOCKS_PER_YEAR,
				})

				if (mounted) {
					setSupplyRate(yearlyRate.toFixed(4))
				}
			} catch (error) {
				console.error('Error fetching supply rate:', {
					error,
					marketName,
					ctokenAddress: ctokenAddress[networkId],
					usingFallback: !active,
				})
				if (mounted) {
					setSupplyRate('0')
				}
			}
		}

		fetchSupplyRate()

		return () => {
			mounted = false
		}
	}, [marketName, library, chainId, ctokenAddress, active])

	const totalApy = Number(supplyRate) + (underlyingApy || 0)

	return {
		totalApy: totalApy.toFixed(4),
		lendingApy: supplyRate,
		underlyingApy: (underlyingApy || 0).toFixed(4),
	}
}
