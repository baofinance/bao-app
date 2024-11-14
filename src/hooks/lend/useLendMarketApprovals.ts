import { BigNumber } from 'ethers'
import MultiCall from '@/utils/multicall'
import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useCallback, useEffect } from 'react'
import { ActiveLendMarket } from '@/bao/lib/types'
import { Contract } from '@ethersproject/contracts'

type LendMarketApprovals = {
	approvals: { [key: string]: BigNumber }
}

export const useLendMarketApprovals = (lendMarket: ActiveLendMarket): LendMarketApprovals => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()

	const enabled = !!bao && !!lendMarket && !!account
	const { data: approvals, refetch } = useQuery(
		['@/hooks/lend/useLendMarketApprovals', providerKey(library, account, chainId), { enabled }],
		async () => {
			const contracts: Contract[] = [lendMarket.underlyingContract]

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(
							contract =>
								contract && {
									ref: lendMarket.underlyingAddress,
									contract: lendMarket.underlyingContract,
									calls: [
										{
											method: 'allowance',
											ref: lendMarket.marketAddress,
											params: [account, lendMarket.marketAddress],
										},
									],
								},
						),
					),
				),
			)

			return Object.keys(res).reduce(
				(approvals: { [key: string]: BigNumber }, address: string) => ({
					...approvals,
					[address]: BigNumber.from(res[address][0].values[0]),
				}),
				{},
			)
		},
		{
			enabled,
		},
	)

	const _refetch = useCallback(() => {
		if (enabled) refetch()
	}, [enabled, refetch])

	useEffect(() => {
		_refetch()
	}, [lendMarket, _refetch])

	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return {
		approvals,
	}
}
