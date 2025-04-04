import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'

// INFO: add to this to support new tokens

export const usePrice = (defiLlamaId: string) => {
	const { data: price } = useQuery(
		['@/hooks/base/usePrice'],
		async () => {
			const req = await fetch(`https://coins.llama.fi/prices/current/${defiLlamaId}`)
			const res = await req.json()

			const coinKey = defiLlamaId
			if (!res.coins || !res.coins[coinKey]) {
				throw new Error(`Can't get ${defiLlamaId} price.`)
			}

			return fromDecimal(res.coins[coinKey].price)
		},
		{
			retry: true,
			retryDelay: 1000 * 60,
			staleTime: 1000 * 60 * 60,
			cacheTime: 1000 * 60 * 120,
			refetchOnReconnect: false,
			refetchInterval: 1000 * 60 * 5,
			keepPreviousData: true,
		},
	)

	return price
}

export default usePrice
