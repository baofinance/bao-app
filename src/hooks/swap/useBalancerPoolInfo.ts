import Config from '@/bao/lib/config'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { BalancerVault__factory } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers/lib/ethers'
import { SwapToken } from '../../bao/lib/types'
import useBao from '../base/useBao'

type BalancerPoolInfo = {
	tokenAddress: string
	tokenDecimals: number
	tokenBalance: BigNumber
}

const useBalancerPoolInfo = (swapToken: SwapToken): BalancerPoolInfo => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()

	const enabled = !!bao && !!library && !!swapToken
	const { data: poolTokenInfo, refetch } = useQuery({
		queryKey: ['@/hooks/swap/useBalancerPoolInfo', providerKey(library, account, chainId), { enabled, id: swapToken.id }],

		queryFn: async () => {
			const balancerVault = BalancerVault__factory.connect(Config.contracts.BalancerVault[chainId].address, library)

			const contracts: any[] = []
			let balance = BigNumber.from(0)

			swapToken.pools.map(pool => {
				contracts.push({
					contract: balancerVault,
					ref: pool.poolAddress,
					calls: [{ method: 'getPoolTokenInfo', params: [pool.poolId, swapToken.tokenAddresses[chainId]] }],
				})
			})

			const query = Multicall.createCallContext(contracts)
			const res = Multicall.parseCallResults(await bao.multicall.call(query))

			swapToken.pools.map(pool => {
				balance = balance.add(res[pool.poolAddress][0].values[0])
			})

			return {
				tokenAddress: swapToken.tokenAddresses[chainId],
				tokenDecimals: 18,
				tokenBalance: balance,
			}
		},

		enabled,
	})

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)
	return poolTokenInfo
}

export default useBalancerPoolInfo
