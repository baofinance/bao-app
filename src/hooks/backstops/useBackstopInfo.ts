import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { ActiveSupportedBackstop } from '../../bao/lib/types'

export type UserShare = {
	userShares: BigNumber
	totalSupply: BigNumber
	collateralCount: BigNumber
	collateralValue: [boolean, BigNumber]
}

const useBackstopInfo = (backstop: ActiveSupportedBackstop): UserShare => {
	const { library, account, chainId } = useWeb3React()

	const enabled = !!library && !!backstop && !!backstop.backstopContract
	const { data: backstopInfo, refetch } = useQuery(
		['@/hooks/backstops/useBackstopInfo', providerKey(library, account, chainId), { enabled, nid: backstop.pid }],
		async () => {
			const supply = await backstop.backstopContract.totalSupply()
			const shares = await backstop.backstopContract.balanceOf(account)
			const collateralCount = await backstop.backstopContract.collateralCount()
			const collateralValue = await backstop.backstopContract.getCollateralValue()
			return {
				userShares: shares,
				totalSupply: supply,
				collateralCount: collateralCount,
				collateralValue: collateralValue,
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

	return backstopInfo
}

export default useBackstopInfo
