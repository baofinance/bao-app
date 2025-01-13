import { useMemo } from 'react'
import { useTotalSupplies } from './useTotalSupplies'
import { useWeb3React } from '@web3-react/core'
import type { Asset } from '@/bao/lib/types'
import { formatUnits } from 'ethers/lib/utils'

// Create separate hooks for each index
const useAssetData = (asset: Asset | null) => {
	const { chainId } = useWeb3React()
	const supplies = useTotalSupplies(asset?.name || '')

	// Debug supplies data
	console.log('useAssetData supplies:', {
		marketName: asset?.name,
		chainId,
		supplies: supplies.map(s => ({
			address: s.address,
			totalSupply: s.totalSupply.toString(),
			decimals: s.decimals,
		})),
	})

	return useMemo(() => {
		if (!asset || !chainId) {
			console.log('Missing asset or chainId:', { asset, chainId })
			return { name: '', supply: 0, borrow: 0, price: 0 }
		}

		// Debug address matching
		console.log('Address matching:', {
			assetAddress: asset.ctokenAddress[chainId].toLowerCase(),
			availableAddresses: supplies.map(s => s.address.toLowerCase()),
		})

		const supplyData = supplies.find(s => s.address.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())

		if (!supplyData) {
			console.log('No supply data found for asset:', asset.name)
			return { name: '', supply: 0, borrow: 0, price: 0 }
		}

		const supply = Number(formatUnits(supplyData.totalSupply, supplyData.decimals))

		// Debug final values
		console.log('Asset data calculated:', {
			name: asset.name,
			rawSupply: supplyData.totalSupply.toString(),
			decimals: supplyData.decimals,
			formattedSupply: supply,
		})

		return {
			name: asset.name,
			supply,
			borrow: 0, // TODO: Add borrow data using similar pattern
			price: 0, // TODO: Add price data using similar pattern
		}
	}, [asset, chainId, supplies])
}

export const useMarketTotals = (assets: Asset[]) => {
	// Ensure assets is an array and validate its contents
	const assetArray = Array.isArray(assets) ? assets.filter(a => a && a.name && a.ctokenAddress) : []

	// Create fixed array of hooks
	const hook0 = useAssetData(assetArray[0] || null)
	const hook1 = useAssetData(assetArray[1] || null)
	const hook2 = useAssetData(assetArray[2] || null)
	const hook3 = useAssetData(assetArray[3] || null)
	const hook4 = useAssetData(assetArray[4] || null)

	return useMemo(() => {
		const hooks = [hook0, hook1, hook2, hook3, hook4]

		return assetArray.map((asset, i) => {
			const hookData = hooks[i] || { name: '', supply: 0, borrow: 0, price: 0 }
			return {
				name: asset.name,
				supply: hookData.supply,
				borrow: hookData.borrow,
				price: hookData.price,
			}
		})
	}, [assetArray, hook0, hook1, hook2, hook3, hook4])
}
