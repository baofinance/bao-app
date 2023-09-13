import { getTvl } from '@/bao/lib/backstop'
import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

export const useUsdToShare = (backstop: ActiveSupportedBackstop, amount: BigNumber) => {
	const { library } = useWeb3React()
	const enabled = !!backstop && !!library
	const { data: usdToShare, refetch } = useQuery(
		['@/hooks/gauges/useUsdToShare', providerKey(library), { enabled, pid: backstop.pid }],
		async () => {
			const totalSupply = await backstop.backstopContract.totalSupply()
			const { tvl } = await getTvl(backstop)
			const share = amount.mul(totalSupply).div(tvl)
			return share
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
