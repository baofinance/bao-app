import { BigNumber } from 'ethers'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useMemo } from 'react'
import { getChainProvider } from '@/utils/getChainProvider'

export type BasketInfo = {
	totalSupply: BigNumber
}

const useBasketInfo = (basket: ActiveSupportedBasket): BasketInfo => {
	// Determine which chain this basket is on
	const basketChainId = useMemo(() => {
		return Object.keys(basket.basketAddresses).map(Number)[0]
	}, [basket])

	// Get provider for the basket's chain
	const basketProvider = useMemo(() => getChainProvider(basketChainId), [basketChainId])

	const enabled = !!basketProvider && !!basket && !!basket.basketContract
	const { data: basketInfo, refetch } = useQuery(
		['@/hooks/baskets/useBasketInfo', basketChainId, { enabled, nid: basket.nid }],
		async () => {
			const supply = await basket.basketContract.totalSupply()
			return {
				totalSupply: supply,
			}
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return basketInfo
}

export default useBasketInfo
