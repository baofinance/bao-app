import { useWeb3React } from '@web3-react/core'
import { useState, useEffect } from 'react'
import { Contract } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export const useAssetBorrows = (marketName: string, assets?: { ctokenAddress: { [key: number]: string } }[]) => {
	const { library, chainId } = useWeb3React()
	const [borrows, setBorrows] = useState<{ [key: string]: string }>({})

	useEffect(() => {
		let mounted = true

		const fetchBorrows = async () => {
			if (!chainId || !library || !assets?.length) {
				console.log('Missing required data in useAssetBorrows:', {
					hasLibrary: !!library,
					chainId,
					hasAssets: !!assets,
					assetsLength: assets?.length,
				})
				return
			}

			const newBorrows: { [key: string]: string } = {}

			for (const asset of assets) {
				const address = asset.ctokenAddress[chainId]
				if (!address) continue

				try {
					const contract = new Contract(address, ['function totalBorrows() view returns (uint256)'], library)
					const totalBorrows = await contract.totalBorrows()
					if (mounted) {
						newBorrows[address.toLowerCase()] = formatUnits(totalBorrows, 18)
					}
				} catch (error) {
					console.error('Error fetching total borrows:', error)
					if (mounted) {
						newBorrows[address.toLowerCase()] = '0'
					}
				}
			}

			if (mounted) {
				setBorrows(newBorrows)
			}
		}

		fetchBorrows()

		return () => {
			mounted = false
		}
	}, [chainId, library, assets])

	return borrows
}

export default useAssetBorrows
