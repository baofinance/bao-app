import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { TotalSupply } from '@/bao/lib/types'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useTotalSupplies = (marketName: string): TotalSupply[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: totalSupplies, refetch } = useQuery({
		queryKey: ['@/hooks/lend/useTotalSupplies', providerKey(library, account, chainId), { enabled, marketName }],

		queryFn: async () => {
			const tokens = Config.lendMarkets[marketName].assets.map(asset => asset.underlyingAddress[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [
								{ method: 'symbol' },
								{
									method: 'balanceOf',
									params: [
										Config.lendMarkets[marketName].assets.find(asset => asset.underlyingAddress[chainId] === contract.address)
											.marketAddress[chainId],
									],
								},
							],
						})),
					),
				),
			)

			return Object.keys(res).map(address => {
				const decimals = Config.lendMarkets[marketName].assets.find(
					asset => asset.underlyingAddress[chainId] === address,
				).underlyingDecimals
				return {
					address,
					symbol: res[address][0].values[0],
					totalSupply: res[address][1].values[0],
					decimals,
				}
			})
		},

		enabled,
	})

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return totalSupplies
}
