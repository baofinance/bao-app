import GraphUtil from '@/utils/graph'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'

const useAuraPool = (poolId: string) => {
	const { chainId } = useWeb3React()

	const { data: poolInfo } = useQuery(
		['@/hooks/base/useAuraPool', { chainId, poolId }],
		async () => {
			const poolInfo = await GraphUtil.getAuraPool(poolId)
			return poolInfo
		},
		{
			enabled: !!chainId,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			placeholderData: {
				address: BigNumber.from(0),
				apr: BigNumber.from(0),
				tvl: BigNumber.from(0),
			},
		},
	)

	return poolInfo
}

export default useAuraPool
