import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Erc20 } from '@/typechain/Erc20'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import useContract from '../base/useContract'

const useAssetSymbol = (assetAddress: string) => {
	const { library, account, chainId } = useWeb3React()
	const erc20 = useContract<Erc20>('Erc20', assetAddress)

	const enabled = !!library
	const { data: assetSymbol, refetch } = useQuery(
		['@/hooks/backstops/useAssetSymbol', providerKey(library, account, chainId), { enabled }],
		async () => {
			if (assetAddress === '0x0000000000000000000000000000000000000000') {
				return 'ETH'
			}

			return erc20.symbol()
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

	return assetSymbol
}

export default useAssetSymbol
