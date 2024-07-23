import Config from '@/bao/lib/config'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { Ctoken__factory, Erc20__factory } from '@/typechain/factories'
import { useWeb3React } from '@web3-react/core'
import { ActiveLendMarket } from '@/bao/lib/types'
import { useCallback, useEffect, useState } from 'react'

export const useActiveLendMarket = (marketName: string): ActiveLendMarket => {
	const { library, account, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [lendMarket, setLendMarket] = useState<ActiveLendMarket>(null)

	const fetchLendMarket = useCallback(
		async (marketName: string) => {
			const signerOrProvider = account ? library.getSigner() : library
			const lendMarket = Config.lendMarkets[marketName]
			const marketAddress = lendMarket.marketAddresses[chainId]
			const underlyingAddress = lendMarket.underlyingAddresses[chainId]
			const marketContract = Ctoken__factory.connect(marketAddress, signerOrProvider)
			const underlyingContract = Erc20__factory.connect(underlyingAddress, signerOrProvider)

			const newActiveLendMarket: ActiveLendMarket = {
				marketAddress: marketAddress,
				marketContract: marketContract,
				underlyingAddress: underlyingAddress,
				underlyingContract: underlyingContract,
			}

			setLendMarket(newActiveLendMarket)
		},
		[chainId, library, account],
	)

	useEffect(() => {
		if (!library || !chainId) return
		fetchLendMarket(marketName)
	}, [fetchLendMarket, library, account, chainId, transactions])

	return lendMarket
}
