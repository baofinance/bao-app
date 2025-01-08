import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'

const BASIC_TOKEN_ABI = [
	'function supplyRatePerBlock() view returns (uint256)',
	'function borrowRatePerBlock() view returns (uint256)',
	'function collateralFactorMantissa() view returns (uint256)',
	'function exchangeRateCurrent() view returns (uint256)',
	'function totalSupply() view returns (uint256)',
	'function totalBorrows() view returns (uint256)',
	'function decimals() view returns (uint8)',
	'function underlying() view returns (address)',
]

const UNDERLYING_TOKEN_ABI = ['function decimals() view returns (uint8)']

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const contractCall = async (
	library: ethers.providers.Web3Provider,
	contractAddress: string,
	abi: string[],
	method: string,
	args: any[] = [],
) => {
	const maxRetries = 5
	const baseDelay = 3000

	for (let i = 0; i < maxRetries; i++) {
		try {
			const contract = new ethers.Contract(contractAddress, abi, library.getSigner())
			const result = await contract[method](...args)
			return result
		} catch (error: any) {
			if (i < maxRetries - 1) {
				const delayTime = baseDelay * Math.pow(2, i)
				await delay(delayTime)
				continue
			}
			console.error(`Failed to call ${method} on ${contractAddress}:`, error)
			return null
		}
	}
	return null
}

export const useMarketData = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const { library, account } = useWeb3React()
	const [data, setData] = useState({
		supplyRate: '0',
		borrowRate: '0',
		collateralFactor: '0',
		price: '0',
		totalSupply: { totalSupply: '0', totalSupplyUSD: '0' },
		totalBorrow: { totalBorrow: '0', totalBorrowUSD: '0' },
	})

	useEffect(() => {
		const fetchData = async () => {
			if (!library || !account || !ctokenAddress[Config.networkId]) return

			try {
				const cTokenDecimals = await contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'decimals')
				await delay(1000)

				const underlyingAddress = await contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'underlying')
				await delay(1000)

				if (!cTokenDecimals || !underlyingAddress) {
					console.error('Failed to get initial token data')
					return
				}

				const underlyingDecimals = await contractCall(library, underlyingAddress, UNDERLYING_TOKEN_ABI, 'decimals')
				await delay(1000)

				if (!underlyingDecimals) {
					console.error('Failed to get underlying decimals')
					return
				}

				const [supplyRate, borrowRate, collateralFactor] = await Promise.all([
					contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'supplyRatePerBlock'),
					contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'borrowRatePerBlock'),
					contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'collateralFactorMantissa'),
				])
				await delay(2000)

				const [exchangeRate, totalSupply, totalBorrow] = await Promise.all([
					contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'exchangeRateCurrent'),
					contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'totalSupply'),
					contractCall(library, ctokenAddress[Config.networkId], BASIC_TOKEN_ABI, 'totalBorrows'),
				])

				if (!supplyRate || !borrowRate || !collateralFactor || !exchangeRate || !totalSupply || !totalBorrow) {
					console.error('Failed to get market data')
					return
				}

				const mantissa = ethers.BigNumber.from(10).pow(18)
				const cTokenMantissa = ethers.BigNumber.from(10).pow(cTokenDecimals)
				const underlyingMantissa = ethers.BigNumber.from(10).pow(underlyingDecimals)

				const actualSupply = totalSupply.mul(exchangeRate).div(mantissa).div(cTokenMantissa).mul(underlyingMantissa)
				const actualBorrow = totalBorrow.mul(underlyingMantissa).div(mantissa)

				setData({
					supplyRate: supplyRate.toString(),
					borrowRate: borrowRate.toString(),
					collateralFactor: collateralFactor.toString(),
					price: exchangeRate.toString(),
					totalSupply: {
						totalSupply: actualSupply.toString(),
						totalSupplyUSD: '0',
					},
					totalBorrow: {
						totalBorrow: actualBorrow.toString(),
						totalBorrowUSD: '0',
					},
				})
			} catch (error) {
				console.error('Error in fetchData:', error)
			}
		}

		fetchData()
	}, [library, account, ctokenAddress, marketName])

	return data
}

// Individual hooks now use the batched data
export const useSupplyRate = (marketName: string, ctokenAddress: { [key: number]: string }, llamaId?: string) => {
	const data = useMarketData(marketName, ctokenAddress)
	return data.supplyRate
}

export const useBorrowRate = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const data = useMarketData(marketName, ctokenAddress)
	return data.borrowRate
}

export const useCollateralFactor = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const data = useMarketData(marketName, ctokenAddress)
	return data.collateralFactor
}

export const usePrice = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const data = useMarketData(marketName, ctokenAddress)
	return data.price
}

export const useTotalSupply = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const data = useMarketData(marketName, ctokenAddress)
	return data.totalSupply
}

export const useTotalBorrow = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const data = useMarketData(marketName, ctokenAddress)
	return data.totalBorrow
}

const marketDataHooks = {
	useSupplyRate,
	useBorrowRate,
	useCollateralFactor,
	usePrice,
	useTotalSupply,
	useTotalBorrow,
}

export default marketDataHooks
