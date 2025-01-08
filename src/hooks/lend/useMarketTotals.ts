import { useMemo } from 'react'
import { useTotalSupply, useTotalBorrow, usePrice } from './useMarketData'
import type { Asset } from '@/bao/lib/types'

// Create separate hooks for each index
const useAssetData = (asset: Asset | null) => {
	const supply = useTotalSupply(asset?.name || '', asset?.ctokenAddress || {})
	const borrow = useTotalBorrow(asset?.name || '', asset?.ctokenAddress || {})
	const price = usePrice(asset?.name || '', asset?.ctokenAddress || {})

	return useMemo(() => ({ supply, borrow, price }), [supply, borrow, price])
}

export const useMarketTotals = (assets: Asset[]) => {
	// Create fixed array of hooks
	const hook0 = useAssetData(assets[0] || null)
	const hook1 = useAssetData(assets[1] || null)
	const hook2 = useAssetData(assets[2] || null)
	const hook3 = useAssetData(assets[3] || null)
	const hook4 = useAssetData(assets[4] || null)

	return useMemo(() => {
		const hooks = [hook0, hook1, hook2, hook3, hook4]

		return assets.map((_, i) => ({
			supply: hooks[i].supply,
			borrow: hooks[i].borrow,
			price: hooks[i].price,
		}))
	}, [assets, hook0, hook1, hook2, hook3, hook4])
}
