import { useMemo } from 'react'
import { useTotalSupplies } from './useTotalSupplies'
import { useWeb3React } from '@web3-react/core'
import type { Asset } from '@/bao/lib/types'
import { formatUnits } from 'ethers/lib/utils'
import Config from '@/bao/lib/config'
import { useTokenPrices } from '@/hooks/useTokenPrices'
import { useTotalDebt } from './useTotalDebt'

const calculateAssetData = (asset: Asset, chainId: number, supplies: any[], marketName: string) => {
	if (!asset || !chainId) {
		console.log('Missing asset or chainId:', { asset, chainId })
		return { name: '', supply: 0, borrow: 0, price: 1 }
	}

	console.log('Address matching:', {
		assetAddress: asset.ctokenAddress[chainId].toLowerCase(),
		availableAddresses: supplies.map(s => s.address.toLowerCase()),
	})

	const supplyData = supplies.find(s => s.address.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())

	if (!supplyData) {
		console.log('No supply data found for asset:', asset.name)
		return { name: '', supply: 0, borrow: 0, price: 1 }
	}

	const supply = Number(formatUnits(supplyData.totalSupply, supplyData.decimals))

	console.log('Asset data calculated:', {
		name: asset.name,
		rawSupply: supplyData.totalSupply.toString(),
		decimals: supplyData.decimals,
		formattedSupply: supply,
	})

	return {
		name: asset.name,
		supply,
		borrow: 0,
		price: 1,
	}
}

export const useMarketTotals = (marketName: string) => {
	const { chainId } = useWeb3React()
	const market = marketName ? Config.vaults[marketName] : null
	const supplies = useTotalSupplies(marketName)
	const totalDebt = useTotalDebt(marketName)
	const tokenPrices = useTokenPrices()

	return useMemo(() => {
		if (!market?.assets || !chainId) {
			console.log('No market data or chainId:', { marketName, chainId })
			return []
		}

		console.log('useMarketTotals data:', {
			marketName,
			chainId,
			supplies: supplies.map(s => ({
				address: s.address,
				totalSupply: s.totalSupply.toString(),
				decimals: s.decimals,
			})),
			totalDebt: totalDebt.map(d => ({
				address: d.marketAddress,
				totalBorrows: d.totalBorrows.toString(),
			})),
		})

		return market.assets.map(asset => {
			const supplyData = supplies.find(s => s.address.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())
			const debtData = totalDebt.find(d => d.marketAddress.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())

			const supply = supplyData ? Number(formatUnits(supplyData.totalSupply, supplyData.decimals)) : 0
			const borrow = debtData ? Number(formatUnits(debtData.totalBorrows, asset.underlyingDecimals)) : 0
			const price = tokenPrices[asset.underlyingAddress[chainId].toLowerCase()] || 0

			console.log('Market total calculation:', {
				asset: asset.name,
				ctokenAddress: asset.ctokenAddress[chainId],
				underlyingAddress: asset.underlyingAddress[chainId],
				supply,
				borrow,
				price,
				tokenPrices,
			})

			return {
				asset,
				supply,
				borrow,
				price,
			}
		})
	}, [market, chainId, marketName, supplies, totalDebt, tokenPrices])
}
