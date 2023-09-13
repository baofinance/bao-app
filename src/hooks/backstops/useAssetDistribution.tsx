import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { getSymbol } from '@/bao/utils'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

export const useAssetDistribution = (backstop: ActiveSupportedBackstop) => {
	const { library, account } = useWeb3React()
	const enabled = !!backstop && !!library
	const { data: assetDistribution, refetch } = useQuery(
		['@/hooks/gauges/useAssetDistribution', providerKey(library), { enabled, pid: backstop.pid }],
		async () => {
			let balancePromise
			const assetAddress = backstop.tokenAddress
			if (assetAddress == '0x0000000000000000000000000000000000000000') {
				// handel ETH
				balancePromise = library.getBalance(backstop.vaultAddress)
			} else {
				balancePromise = backstop.tokenContract.balanceOf(account)
			}

			const [poolBalance, symbol] = await Promise.all([balancePromise, getSymbol(backstop.tokenContract)])

			return {
				assetAddress,
				poolBalance,
				symbol,
			}
		},
		{
			enabled,
			placeholderData: {
				assetAddress: '',
				poolBalance: BigNumber.from(0),
				symbol: '',
			},
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return assetDistribution
}

export default useAssetDistribution
