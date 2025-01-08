import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'
import { formatUnits } from 'ethers/lib/utils'

const CTOKEN_ABI = ['function totalSupply() view returns (uint256)', 'function exchangeRateStored() view returns (uint256)']

// Create a fallback provider
const FALLBACK_PROVIDER = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_URL)

export const useTotalSupply = (marketName: string, ctokenAddress?: { [key: number]: string }) => {
	const { library, chainId, active } = useWeb3React()
	const [totalSupply, setTotalSupply] = useState<string>('0')

	useEffect(() => {
		let mounted = true

		const fetchTotalSupply = async () => {
			// Use fallback provider if web3 isn't connected
			const provider = active ? library : FALLBACK_PROVIDER
			const networkId = chainId || 1 // Default to mainnet

			if (!ctokenAddress || !ctokenAddress[networkId]) {
				console.log('Missing required data in useTotalSupply:', {
					hasCtokenAddress: !!ctokenAddress,
					ctokenAddressForChain: ctokenAddress?.[networkId],
				})
				return
			}

			try {
				const contract = new ethers.Contract(ctokenAddress[networkId], CTOKEN_ABI, provider)

				const [totalSupplyRaw, exchangeRate] = await Promise.all([contract.totalSupply(), contract.exchangeRateStored()])

				// Convert from cToken to underlying token amount
				const adjustedSupply = totalSupplyRaw.mul(exchangeRate).div(ethers.utils.parseEther('1'))

				if (mounted) {
					setTotalSupply(formatUnits(adjustedSupply, 18))
				}
			} catch (error) {
				console.error('Error fetching total supply:', {
					error,
					marketName,
					ctokenAddress: ctokenAddress[networkId],
					usingFallback: !active,
				})
				if (mounted) {
					setTotalSupply('0')
				}
			}
		}

		fetchTotalSupply()

		return () => {
			mounted = false
		}
	}, [library, chainId, ctokenAddress, marketName, active])

	return totalSupply
}
