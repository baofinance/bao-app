import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { Ctoken__factory, Erc20__factory } from '@/typechain/factories'
import { useWeb3React } from '@web3-react/core'
import { ActiveLendMarket, Asset } from '@/bao/lib/types'
import { useCallback, useEffect, useState } from 'react'

export const useActiveLendMarket = (asset: Asset): ActiveLendMarket => {
	const { library, account, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [lendMarket, setLendMarket] = useState<ActiveLendMarket>(null)

	const fetchLendMarket = useCallback(async () => {
		if (!asset || !library || !chainId) return

		const signerOrProvider = account ? library.getSigner() : library

		const marketAddress = asset.marketAddress?.[chainId]
		const underlyingAddress = asset.underlyingAddress?.[chainId]

		if (!marketAddress || !underlyingAddress) {
			return
		}
		const marketContract = Ctoken__factory.connect(marketAddress, signerOrProvider)
		const underlyingContract = Erc20__factory.connect(underlyingAddress, signerOrProvider)

		setLendMarket({
			marketAddress,
			marketContract,
			underlyingAddress,
			underlyingContract,
		})
	}, [asset, library, account, chainId])

	useEffect(() => {
		fetchLendMarket()
	}, [fetchLendMarket])

	return lendMarket
}
