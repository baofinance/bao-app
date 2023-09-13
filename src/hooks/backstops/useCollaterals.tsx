import { getAssetDistrobution } from '@/bao/lib/backstop'
import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

export const useCollaterals = (backstop: ActiveSupportedBackstop) => {
	const { library } = useWeb3React()
	const enabled = !!backstop && !!library
	const { data: collaterals, refetch } = useQuery(
		['@/hooks/gauges/useCollaterals', providerKey(library), { enabled, pid: backstop.pid }],
		async () => {
			const promises = []
			for (let i = 0; i < 10; i++) {
				const promise = backstop.backstopContract
					.collaterals(i)
					.then(async address => await getAssetDistrobution(library, backstop, address))
					.catch(err => null)
				promises.push(promise)
			}
			const collaterals = (await Promise.all(promises)).filter(x => x)
			return collaterals
		},
		{
			enabled,
			placeholderData: [],
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return collaterals
}

export default useCollaterals
