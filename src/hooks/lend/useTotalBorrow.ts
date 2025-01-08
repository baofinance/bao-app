import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'
import { formatUnits } from 'ethers/lib/utils'

const CTOKEN_ABI = ['function totalBorrows() view returns (uint256)']

export const useTotalBorrow = (marketName: string, ctokenAddress?: { [key: number]: string }) => {
	const { library, chainId } = useWeb3React()
	const [totalBorrow, setTotalBorrow] = useState<string>('0')

	useEffect(() => {
		let mounted = true

		const fetchTotalBorrow = async () => {
			if (!library || !chainId || !ctokenAddress || !ctokenAddress[chainId]) {
				console.log('Missing required data in useTotalBorrow:', {
					hasLibrary: !!library,
					chainId,
					hasCtokenAddress: !!ctokenAddress,
					ctokenAddressForChain: ctokenAddress?.[chainId],
				})
				return
			}

			try {
				const signer = library.getSigner()
				const contract = new ethers.Contract(ctokenAddress[chainId], CTOKEN_ABI, signer)
				const totalBorrowsRaw = await contract.totalBorrows()

				if (mounted) {
					setTotalBorrow(formatUnits(totalBorrowsRaw, 18))
				}
			} catch (error) {
				console.error('Error fetching total borrow:', error)
				if (mounted) {
					setTotalBorrow('0')
				}
			}
		}

		fetchTotalBorrow()

		return () => {
			mounted = false
		}
	}, [library, chainId, ctokenAddress, marketName])

	return totalBorrow
}
