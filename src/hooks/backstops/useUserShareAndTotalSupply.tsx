import { getTvl } from '@/bao/lib/backstop'
import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

export const useUserShareAndTotalSupply = (backstop: ActiveSupportedBackstop) => {
	const { library, account } = useWeb3React()
	const enabled = !!backstop && !!library
	const { data: userShareAndTotalSupply, refetch } = useQuery(
		['@/hooks/gauges/useUserShareAndTotalSupply', providerKey(library), { enabled, pid: backstop.pid }],
		async () => {
			const userSharePromise = backstop.backstopContract.balanceOf(account)
			const totalSupplyPromise = backstop.backstopContract.totalSupply()

			const [userShare, totalSupply] = await Promise.all([userSharePromise, totalSupplyPromise])
			return { userShare, totalSupply }
		},
		{
			enabled,
			placeholderData: {
				userShare: BigNumber.from(0),
				totalSupply: BigNumber.from(0),
			},
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return userShareAndTotalSupply
}

export default useUserShareAndTotalSupply
