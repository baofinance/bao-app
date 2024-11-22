import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useTotalDebt = (marketName: string, assetAddresses?: string[]): Record<string, BigNumber> => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: totalDebts, refetch } = useQuery(
		['@/hooks/lend/useTotalDebts', providerKey(library, account, chainId), { enabled, marketName, assetAddresses }],
		async () => {
			const addresses = assetAddresses || [Config.lendMarkets[marketName].marketAddresses[chainId]]
			const contracts: Contract[] = addresses.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'symbol' }, { method: 'totalBorrows' }],
						})),
					),
				),
			)

			return Object.keys(res).reduce(
				(acc, address) => {
					acc[address] = res[address][1].values[0]
					return acc
				},
				{} as Record<string, BigNumber>,
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return totalDebts || {}
}
