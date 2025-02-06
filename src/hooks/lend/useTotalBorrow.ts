import { useWeb3React } from '@web3-react/core'
import { useState, useEffect } from 'react'
import { Contract } from 'ethers'

export const useTotalBorrow = (marketName: string, ctokenAddresses: { [key: number]: string }[]) => {
	const { library, chainId } = useWeb3React()
	const [totalBorrows, setTotalBorrows] = useState<{ [key: string]: string }>({})

	useEffect(() => {
		let mounted = true

		const fetchTotalBorrows = async () => {
			if (!chainId || !library || !ctokenAddresses.length) return

			const newBorrows: { [key: string]: string } = {}

			for (const addressMap of ctokenAddresses) {
				const address = addressMap[chainId]
				if (!address) continue

				try {
					const contract = new Contract(address, ['function totalBorrows() view returns (uint256)'], library)
					const totalBorrow = await contract.totalBorrows()
					if (mounted) {
						newBorrows[address.toLowerCase()] = totalBorrow.toString()
					}
				} catch (error) {
					console.error('Error fetching total borrows:', error)
					if (mounted) {
						newBorrows[address.toLowerCase()] = '0'
					}
				}
			}

			if (mounted) {
				setTotalBorrows(newBorrows)
			}
		}

		fetchTotalBorrows()

		return () => {
			mounted = false
		}
	}, [chainId, library, ctokenAddresses])

	return totalBorrows
}

export default useTotalBorrow
