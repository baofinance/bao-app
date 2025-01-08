import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { Config } from '@/bao/lib/config'

// Supply Rate Hook
export const useSupplyRate = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const [rate, setRate] = useState<string>('0')

	useEffect(() => {
		const fetchRate = async () => {
			const result = await contractCall(ctokenAddress[Config.networkId], 'supplyRatePerBlock')
			setRate(result || '0')
		}

		fetchRate()
	}, [ctokenAddress])

	return rate
}

// Borrow Rate Hook
export const useBorrowRate = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const [rate, setRate] = useState<string>('0')

	useEffect(() => {
		const fetchRate = async () => {
			const result = await contractCall(ctokenAddress[Config.networkId], 'borrowRatePerBlock')
			setRate(result || '0')
		}

		fetchRate()
	}, [ctokenAddress])

	return rate
}

// Collateral Factor Hook
export const useCollateralFactor = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const [factor, setFactor] = useState<string>('0')

	useEffect(() => {
		const fetchFactor = async () => {
			const result = await contractCall(ctokenAddress[Config.networkId], 'collateralFactorMantissa')
			setFactor(result || '0')
		}

		fetchFactor()
	}, [ctokenAddress])

	return factor
}

// Price Hook
export const usePrice = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const [price, setPrice] = useState<string>('0')

	useEffect(() => {
		const fetchPrice = async () => {
			const result = await contractCall(ctokenAddress[Config.networkId], 'exchangeRateCurrent')
			setPrice(result || '0')
		}

		fetchPrice()
	}, [ctokenAddress])

	return price
}

// Total Supply Hook
export const useTotalSupply = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const [supply, setSupply] = useState<{ totalSupply: string; totalSupplyUSD: string }>({
		totalSupply: '0',
		totalSupplyUSD: '0',
	})

	useEffect(() => {
		const fetchSupply = async () => {
			const result = await contractCall(ctokenAddress[Config.networkId], 'totalSupply')
			setSupply({
				totalSupply: result || '0',
				totalSupplyUSD: '0', // Calculate USD value if needed
			})
		}

		fetchSupply()
	}, [ctokenAddress])

	return supply
}

// Total Borrow Hook
export const useTotalBorrow = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const [borrow, setBorrow] = useState<{ totalBorrow: string; totalBorrowUSD: string }>({
		totalBorrow: '0',
		totalBorrowUSD: '0',
	})

	useEffect(() => {
		const fetchBorrow = async () => {
			const result = await contractCall(ctokenAddress[Config.networkId], 'totalBorrows')
			setBorrow({
				totalBorrow: result || '0',
				totalBorrowUSD: '0', // Calculate USD value if needed
			})
		}

		fetchBorrow()
	}, [ctokenAddress])

	return borrow
}

export const useMarketData = () => {
	const { library, account } = useWeb3React()

	const contractCall = useCallback(
		async (contractAddress: string, method: string, args: any[] = []) => {
			if (!library || !account) return null

			try {
				const contract = new ethers.Contract(contractAddress, [], library)
				const result = await contract[method](...args)
				return result
			} catch (error) {
				console.error(`Error calling ${method}:`, error)
				return null
			}
		},
		[library, account],
	)

	return { contractCall }
}
