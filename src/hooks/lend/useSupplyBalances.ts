import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory, Erc20__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import { Balance } from '@/bao/lib/types'
import Config from '@/bao/lib/config'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useSupplyBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: balances, refetch } = useQuery(
		['@/hooks/lend/useSupplyBalances', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const contracts: Contract[] = Config.lendMarkets[marketName].assets
				.map(asset => asset.marketAddress[chainId])
				.map(address => Ctoken__factory.connect(address, library))
			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [
								{ method: 'symbol' },
								{
									method: 'balanceOfUnderlying',
									params: [account],
								},
								{ method: 'decimals' },
							],
						})),
					),
				),
			)

			return Object.keys(res).map(address => {
				return {
					address,
					symbol: res[address][0].values[0],
					balance: res[address][1].values[0],
					decimals: res[address][2].values[0],
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

	useTxReceiptUpdater(_refetch)

	return balances
}
