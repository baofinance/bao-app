import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import Config from '@/bao/lib/config'
import { Market } from '@/bao/lib/types'
import { useDefiLlamaApy } from './useDefiLlamaApy'

const BASIC_TOKEN_ABI = [
	'function decimals() view returns (uint8)',
	'function underlying() view returns (address)',
	'function supplyRatePerBlock() view returns (uint256)',
	'function borrowRatePerBlock() view returns (uint256)',
	'function collateralFactorMantissa() view returns (uint256)',
	'function exchangeRateCurrent() view returns (uint256)',
	'function totalSupply() view returns (uint256)',
	'function totalBorrows() view returns (uint256)',
]

interface MarketData {
	supplyRate: string
	borrowRate: string
	collateralFactor: string
	price: string
	totalSupply: { totalSupply: string; totalSupplyUSD: string }
	totalBorrow: { totalBorrow: string; totalBorrowUSD: string }
}

export const useMarketData = (marketName: string, ctokenAddress: { [key: number]: string }): MarketData => {
	const { library, account } = useWeb3React()
	const [data, setData] = useState<MarketData>({
		supplyRate: '0',
		borrowRate: '0',
		collateralFactor: '0',
		price: '0',
		totalSupply: { totalSupply: '0', totalSupplyUSD: '0' },
		totalBorrow: { totalBorrow: '0', totalBorrowUSD: '0' },
	})

	const contractCall = useCallback(
		async (contractAddress: string, method: string, args: any[] = []) => {
			if (!library || !account) return null

			try {
				const contract = new ethers.Contract(contractAddress, BASIC_TOKEN_ABI, library)
				const result = await contract[method](...args)
				return result
			} catch (error) {
				console.error(`Error calling ${method}:`, error)
				return null
			}
		},
		[library, account],
	)

	useEffect(() => {
		const fetchData = async () => {
			if (!library || !account || !ctokenAddress[Config.networkId]) return

			try {
				const [supplyRate, borrowRate, collateralFactor] = await Promise.all([
					contractCall(ctokenAddress[Config.networkId], 'supplyRatePerBlock'),
					contractCall(ctokenAddress[Config.networkId], 'borrowRatePerBlock'),
					contractCall(ctokenAddress[Config.networkId], 'collateralFactorMantissa'),
				])

				const [exchangeRate, totalSupply, totalBorrow] = await Promise.all([
					contractCall(ctokenAddress[Config.networkId], 'exchangeRateCurrent'),
					contractCall(ctokenAddress[Config.networkId], 'totalSupply'),
					contractCall(ctokenAddress[Config.networkId], 'totalBorrows'),
				])

				setData({
					supplyRate: supplyRate?.toString() || '0',
					borrowRate: borrowRate?.toString() || '0',
					collateralFactor: collateralFactor?.toString() || '0',
					price: exchangeRate?.toString() || '0',
					totalSupply: {
						totalSupply: totalSupply?.toString() || '0',
						totalSupplyUSD: '0',
					},
					totalBorrow: {
						totalBorrow: totalBorrow?.toString() || '0',
						totalBorrowUSD: '0',
					},
				})
			} catch (error) {
				console.error('Error fetching market data:', error)
			}
		}

		fetchData()
	}, [library, account, ctokenAddress, marketName, contractCall])

	return data
}

// Supply Rate Hook
export const useSupplyRate = (
	marketName: string,
	ctokenAddress?: { [key: number]: string },
	llamaId?: string,
): { totalApy: string; lendingApy: string; underlyingApy: string } | null => {
	const marketData = useMarketData(marketName, ctokenAddress || {})
	const underlyingApy = useDefiLlamaApy(llamaId)

	if (!marketData?.supplyRate) return null

	const totalApy = Number(marketData.supplyRate) + (underlyingApy || 0)
	return {
		totalApy: totalApy.toFixed(4),
		lendingApy: marketData.supplyRate,
		underlyingApy: (underlyingApy || 0).toFixed(4),
	}
}

// Borrow Rate Hook
export const useBorrowRate = (marketName: string, ctokenAddress: { [key: number]: string }): string => {
	const marketData = useMarketData(marketName, ctokenAddress)
	return marketData.borrowRate
}

// Collateral Factor Hook
export const useCollateralFactor = (marketName: string, ctokenAddress: { [key: number]: string }): string => {
	const marketData = useMarketData(marketName, ctokenAddress)
	return marketData.collateralFactor
}

// Price Hook
export const usePrice = (marketName: string, ctokenAddress: { [key: number]: string }): string => {
	const marketData = useMarketData(marketName, ctokenAddress)
	return marketData.price
}

// Total Supply Hook
export const useTotalSupply = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const marketData = useMarketData(marketName, ctokenAddress)
	return marketData.totalSupply
}

// Total Borrow Hook
export const useTotalBorrow = (marketName: string, ctokenAddress: { [key: number]: string }) => {
	const marketData = useMarketData(marketName, ctokenAddress)
	return marketData.totalBorrow
}
