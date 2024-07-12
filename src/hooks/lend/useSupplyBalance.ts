import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Asset, Balance } from '@/bao/lib/types'
import Config from '@/bao/lib/config'

export const useSupplyBalance = (): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId
	const { data: balances, refetch } = useQuery(
		['@/hooks/lend/useSupplyBalances', providerKey(library, account, chainId), { enabled }],
		async () => {
			const assets = Config.assets.filter(asset => asset.supply == true)
			const contracts: Contract[] = assets.map(asset => Ctoken__factory.connect(asset.underlyingAddress[chainId], library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'symbol' }, { method: 'balanceOf', params: [account] }],
						})),
					),
				),
			)

			return Object.keys(res).map(address => {
				return {
					address,
					symbol: res[address][0].values[0],
					balance: res[address][1].values[0],
					decimals: 18,
				}
			})
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return balances
}
