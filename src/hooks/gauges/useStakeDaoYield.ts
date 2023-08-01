import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

// INFO: add to this to support new tokens

export const useStakeDaoYield = (key: string, name: string) => {
	const { data: apr } = useQuery(
		['@/hooks/base/useStakeDaoYield', { key }],
		async () => {
			const res = await fetch('https://lockers.stakedao.org/api/strategies/cache/balancer', { mode: 'no-cors' })
			const data = await res.json()
			const _data = data.data
			const targetItem = _data.find((item: { key: string }) => item.key === key)
			if (!targetItem) throw new Error(`Can't get yield for StakeDAO strategy ${name}.`)

			const apr = targetItem.projectedAprWithoutUserBoost
			return apr
		},
		{
			retry: true,
			retryDelay: 1000 * 60,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			staleTime: 1000 * 60 * 5,
			cacheTime: 1000 * 60 * 10,
			keepPreviousData: true,
			placeholderData: '',
		},
	)
	return apr
}

export default useStakeDaoYield
