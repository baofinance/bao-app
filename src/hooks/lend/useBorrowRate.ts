import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

const CTOKEN_ABI = ['function borrowRatePerBlock() view returns (uint256)']

// Ethereum block time is ~12.04 seconds
const BLOCKS_PER_DAY = (24 * 60 * 60) / 12.04
const DAYS_PER_YEAR = 365
const BLOCKS_PER_YEAR = Math.floor(BLOCKS_PER_DAY * DAYS_PER_YEAR)

const logBorrowRate = (borrowRatePerBlock: string, yearlyRate: number) => {
	console.log('Borrow rate calculation:', {
		borrowRatePerBlock,
		yearlyRate,
		BLOCKS_PER_YEAR,
		blockTime: 12.04,
		blocksPerDay: BLOCKS_PER_DAY,
	})
}

export function useBorrowRate(marketName: string, ctokenAddress: { [key: number]: string }) {
	const { library, chainId } = useWeb3React()
	const [borrowRate, setBorrowRate] = useState<string>('0')

	useEffect(() => {
		let mounted = true

		const fetchBorrowRate = async () => {
			if (!library || !chainId || !ctokenAddress[chainId]) return

			try {
				const contract = new ethers.Contract(ctokenAddress[chainId], CTOKEN_ABI, library)
				const borrowRatePerBlock = await contract.borrowRatePerBlock()

				// Convert to yearly rate
				// The rate is actually in 1e18 format per block
				const yearlyRate = Number(formatUnits(borrowRatePerBlock, 18)) * BLOCKS_PER_YEAR * 100

				logBorrowRate(borrowRatePerBlock.toString(), yearlyRate)

				if (mounted) {
					setBorrowRate(yearlyRate.toFixed(4))
				}
			} catch (error) {
				console.error('Error fetching borrow rate:', error)
				if (mounted) {
					setBorrowRate('0')
				}
			}
		}

		fetchBorrowRate()

		return () => {
			mounted = false
		}
	}, [library, chainId, ctokenAddress])

	return borrowRate
}
