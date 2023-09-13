import { getTvl, getUserShareAndTotalSupply } from '@/bao/lib/backstop'
import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

export const useUsdToShare = (backstop: ActiveSupportedBackstop) => {
	const { library, account } = useWeb3React()
	const enabled = !!backstop && !!library
	const { data: usdToShare, refetch } = useQuery(
		['@/hooks/gauges/useUsdToShare', providerKey(library), { enabled, pid: backstop.pid }],
		async () => {
			const tvlPromise = await getTvl(backstop)
			const sharePromise = await getUserShareAndTotalSupply(backstop, account)
			const [{ tvl }, { userShare, totalSupply }] = await Promise.all([tvlPromise, sharePromise])

			let usdVal
			if (totalSupply.isZero()) {
				usdVal = BigNumber.from(0)
			} else {
				usdVal = tvl.mul(userShare).div(totalSupply)
			}

			return usdVal
		},
		{
			enabled,
			placeholderData: BigNumber.from(0),
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return usdToShare
}

export default useUsdToShare
