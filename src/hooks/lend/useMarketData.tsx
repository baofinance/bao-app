import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { Market } from '@/bao/lib/types'
import Config from '@/bao/lib/config'
import { useDefiLlamaApy } from './useDefiLlamaApy'

const BLOCKS_PER_YEAR = 2628000 // 365 * 7200
const DEBOUNCE_DELAY = 10000 // 10 seconds
const ERROR_RETRY_DELAY = 5000 // 5 seconds
const MAX_RETRIES = 3

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

interface MarketData {
	supplyRate: string
	borrowRate: string
	collateralFactor: string
	price: string
	totalSupply: { totalSupply: string; totalSupplyUSD: string }
	totalBorrow: { totalBorrow: string; totalBorrowUSD: string }
	lastUpdate: number
}

const initialData: MarketData = {
	supplyRate: '0',
	borrowRate: '0',
	collateralFactor: '0',
	price: '0',
	totalSupply: { totalSupply: '0', totalSupplyUSD: '0' },
	totalBorrow: { totalBorrow: '0', totalBorrowUSD: '0' },
	lastUpdate: 0,
}

export const useMarketData = (marketName: string, ctokenAddress: { [key: number]: string } | undefined) => {
	const { library, chainId } = useWeb3React()
	const [data, setData] = useState<MarketData>(initialData)
	const [error, setError] = useState<Error | null>(null)
	const retryCount = useRef(0)
	const timeoutRef = useRef<NodeJS.Timeout>()
	const lastFetchTime = useRef(0)
	const isMounted = useRef(true)

	// Memoize the contract instance
	const contract = useMemo(() => {
		if (!library || !chainId || !ctokenAddress?.[chainId]) return null
		try {
			return new ethers.Contract(ctokenAddress[chainId], BASIC_TOKEN_ABI, library)
		} catch (err) {
			console.error('Error creating contract instance:', err)
			return null
		}
	}, [library, chainId, ctokenAddress])

	const fetchData = useCallback(async () => {
		if (!contract || !isMounted.current) return

		// Debounce checks
		const now = Date.now()
		if (now - lastFetchTime.current < DEBOUNCE_DELAY) {
			return
		}

		try {
			console.log('Fetching market data...')
			const [supplyRate, borrowRate, collateralFactor] = await Promise.all([
				contract.supplyRatePerBlock().catch(() => '0'),
				contract.borrowRatePerBlock().catch(() => '0'),
				contract.collateralFactorMantissa().catch(() => '0'),
			])

			const [exchangeRate, totalSupply, totalBorrow] = await Promise.all([
				contract.exchangeRateCurrent().catch(() => '0'),
				contract.totalSupply().catch(() => '0'),
				contract.totalBorrows().catch(() => '0'),
			])

			if (!isMounted.current) return

			const newData = {
				supplyRate: supplyRate.toString(),
				borrowRate: borrowRate.toString(),
				collateralFactor: collateralFactor.toString(),
				price: exchangeRate.toString(),
				totalSupply: {
					totalSupply: totalSupply.toString(),
					totalSupplyUSD: '0',
				},
				totalBorrow: {
					totalBorrow: totalBorrow.toString(),
					totalBorrowUSD: '0',
				},
				lastUpdate: now,
			}

			// Only update if values have changed
			if (JSON.stringify(newData) !== JSON.stringify(data)) {
				setData(newData)
			}

			setError(null)
			retryCount.current = 0
			lastFetchTime.current = now
		} catch (err) {
			console.error('Error fetching market data:', err)
			setError(err as Error)

			if (retryCount.current < MAX_RETRIES) {
				retryCount.current++
				timeoutRef.current = setTimeout(fetchData, ERROR_RETRY_DELAY)
			}
		}
	}, [contract, data])

	useEffect(() => {
		isMounted.current = true

		// Initial fetch
		fetchData()

		// Set up interval for periodic updates
		const intervalId = setInterval(fetchData, DEBOUNCE_DELAY)

		return () => {
			isMounted.current = false
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			clearInterval(intervalId)
		}
	}, [fetchData])

	// Return memoized data to prevent unnecessary re-renders
	return useMemo(
		() => ({
			...data,
			error,
			isLoading: !error && data.lastUpdate === 0,
		}),
		[data, error],
	)
}

export const useSupplyRate = (
	marketName: string,
	ctokenAddress?: { [key: number]: string },
	llamaId?: string,
): { totalApy: string; lendingApy: string; underlyingApy: string } => {
	const marketData = useMarketData(marketName, ctokenAddress)
	const underlyingApy = useDefiLlamaApy(llamaId)

	return useMemo(() => {
		const supplyRatePerBlock = Number(marketData.supplyRate) / 1e18
		const lendingApy = (Math.pow(1 + supplyRatePerBlock, BLOCKS_PER_YEAR) - 1) * 100
		const totalApy = lendingApy + (underlyingApy || 0)

		return {
			totalApy: totalApy.toFixed(4),
			lendingApy: lendingApy.toFixed(4),
			underlyingApy: (underlyingApy || 0).toFixed(4),
		}
	}, [marketData.supplyRate, underlyingApy])
}

export const useBorrowRate = (marketName: string, ctokenAddress: { [key: number]: string }): string => {
	const marketData = useMarketData(marketName, ctokenAddress)
	return marketData.borrowRate
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
