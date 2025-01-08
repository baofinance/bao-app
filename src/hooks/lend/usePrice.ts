import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'

const ORACLE_ABI = ['function getUnderlyingPrice(address) view returns (uint256)']

export const usePrice = (marketName: string, ctokenAddress: { [key: number]: string } | undefined) => {
	const { library, chainId } = useWeb3React()
	const [price, setPrice] = useState<string>('0')

	useEffect(() => {
		let mounted = true

		const fetchPrice = async () => {
			if (!library || !chainId || !ctokenAddress || !ctokenAddress[chainId]) {
				console.log('Missing required data:', {
					hasLibrary: !!library,
					chainId,
					hasCtokenAddress: !!ctokenAddress,
					ctokenAddressForChain: ctokenAddress?.[chainId],
				})
				return
			}

			try {
				const market = Config.vaults[marketName]
				if (!market) return

				const signer = library.getSigner()
				const oracle = new ethers.Contract(market.oracle, ORACLE_ABI, signer)
				const priceRaw = await oracle.getUnderlyingPrice(ctokenAddress[chainId])

				if (mounted) {
					setPrice(ethers.utils.formatUnits(priceRaw, 18))
				}
			} catch (error) {
				console.error('Error fetching price:', error)
				if (mounted) {
					setPrice('0')
				}
			}
		}

		fetchPrice()

		return () => {
			mounted = false
		}
	}, [library, chainId, ctokenAddress, marketName])

	return price
}
