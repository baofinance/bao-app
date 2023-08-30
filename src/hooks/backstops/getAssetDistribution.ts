import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Erc20 } from '@/typechain/Erc20'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useContract from '../base/useContract'

export type AssetDistribution = {
	assetAddress: string
	balance: BigNumber
	symbol: string
}

const useAssetDistribution = (assetAddress: string): AssetDistribution => {
	const { library, account, chainId } = useWeb3React()
	const erc20 = useContract<Erc20>('Erc20', assetAddress)

	const enabled = !!library
	const { data: assetDistribution, refetch } = useQuery(
		['@/hooks/backstops/useAssetDistribution', providerKey(library, account, chainId), { enabled }],
		async () => {
			let balance, symbol
			if (assetAddress === '0x0000000000000000000000000000000000000000') {
				balance = library.getBalance(account)
				symbol = 'ETH'
			} else {
				balance = erc20.balanceOf(account)
				symbol = erc20.symbol()
			}
			return {
				assetAddress: assetAddress,
				balance: balance,
				symbol: symbol.toString(),
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

	return assetDistribution
}

export default useAssetDistribution
