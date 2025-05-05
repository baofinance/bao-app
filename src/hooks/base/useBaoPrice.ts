import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'

// INFO: add to this to support new tokens

export const useBaoPrice = () => {
	const { data: baoPrice } = useQuery({
		queryKey: ['@/hooks/base/usePrice'],

		queryFn: async () => {
			const req = await fetch(`https://coins.llama.fi/prices/current/ethereum:0xce391315b414d4c7555956120461d21808a69f3a?searchWidth=4h`)
			const res = await req.json()

			const coinKey = 'ethereum:0xce391315b414d4c7555956120461d21808a69f3a'
			if (!res.coins || !res.coins[coinKey]) {
				throw new Error("Can't get BAO price.")
			}

			return fromDecimal(res.coins[coinKey].price)
		},

		retry: true,
		retryDelay: 1000 * 60,
		staleTime: 1000 * 60 * 60,
		refetchOnReconnect: false,
		refetchInterval: 1000 * 60 * 5,
	})

	return baoPrice
}

export default useBaoPrice
