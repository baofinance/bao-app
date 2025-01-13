import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { Config } from '@/bao/lib/config'
import CERC20_ABI from '@/bao/lib/abi/CERC20.json'

// Helper function to create contract instance
const getContract = (address: string, library: any) => {
	if (!library || !address) return null
	try {
		return new ethers.Contract(address, CERC20_ABI, library)
	} catch (error) {
		console.error('Failed to create contract:', error)
		return null
	}
}

// Supply Rate Hook
export const useSupplyRate = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const { library } = useWeb3React()
	const [rate, setRate] = useState<string>('0')

	useEffect(() => {
		const fetchRate = async () => {
			try {
				const address = ctokenAddress[Config.networkId]
				const contract = getContract(address, library)
				if (!contract) return

				const rate = await contract.supplyRatePerBlock()
				setRate(rate.toString())
			} catch (error) {
				console.error(`Error fetching supply rate for ${marketName}:`, error)
			}
		}

		if (library && ctokenAddress[Config.networkId]) {
			fetchRate()
		}
	}, [library, ctokenAddress, marketName])

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
	const { library } = useWeb3React()
	const [price, setPrice] = useState<string>('0')

	useEffect(() => {
		const fetchPrice = async () => {
			try {
				const address = ctokenAddress[Config.networkId]
				const contract = getContract(address, library)
				if (!contract) return

				const exchangeRate = await contract.exchangeRateCurrent()
				setPrice(exchangeRate.toString())
			} catch (error) {
				console.error(`Error fetching price for ${marketName}:`, error)
			}
		}

		if (library && ctokenAddress[Config.networkId]) {
			fetchPrice()
		}
	}, [library, ctokenAddress, marketName])

	return price
}

// Total Supply Hook
export const useTotalSupply = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const { library } = useWeb3React()
	const [supply, setSupply] = useState<{ totalSupply: string; totalSupplyUSD: string }>({
		totalSupply: '0',
		totalSupplyUSD: '0',
	})

	useEffect(() => {
		const fetchSupply = async () => {
			try {
				const address = ctokenAddress[Config.networkId]
				const contract = getContract(address, library)
				if (!contract) return

				const totalSupply = await contract.totalSupply()
				const exchangeRate = await contract.exchangeRateCurrent()

				// Convert to proper units
				const adjustedSupply = totalSupply.mul(exchangeRate).div(ethers.constants.WeiPerEther)

				setSupply({
					totalSupply: adjustedSupply.toString(),
					totalSupplyUSD: '0', // Calculate USD value if needed
				})
			} catch (error) {
				console.error(`Error fetching supply for ${marketName}:`, error)
			}
		}

		if (library && ctokenAddress[Config.networkId]) {
			fetchSupply()
		}
	}, [library, ctokenAddress, marketName])

	return supply
}

// Total Borrow Hook
export const useTotalBorrow = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const { library } = useWeb3React()
	const [borrow, setBorrow] = useState<{ totalBorrow: string; totalBorrowUSD: string }>({
		totalBorrow: '0',
		totalBorrowUSD: '0',
	})

	useEffect(() => {
		const fetchBorrow = async () => {
			try {
				const address = ctokenAddress[Config.networkId]
				const contract = getContract(address, library)
				if (!contract) return

				const totalBorrows = await contract.totalBorrows()

				setBorrow({
					totalBorrow: totalBorrows.toString(),
					totalBorrowUSD: '0', // Calculate USD value if needed
				})
			} catch (error) {
				console.error(`Error fetching borrows for ${marketName}:`, error)
			}
		}

		if (library && ctokenAddress[Config.networkId]) {
			fetchBorrow()
		}
	}, [library, ctokenAddress, marketName])

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
