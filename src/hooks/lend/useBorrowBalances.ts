import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { Balance } from '@/bao/lib/types'
import { BigNumber } from 'ethers'

export const useBorrowBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId
	const { data: balances } = useQuery(
		['@/hooks/lend/useBorrowBalances', providerKey(library, account, chainId), { enabled }],
		async () => {
			const tokens = Config.lendMarkets[marketName].assets.map(asset => asset.marketAddress[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'symbol' }, { method: 'balanceOfUnderlying', params: [account] }],
						})),
					),
				),
			)

			return Object.keys(res).map(address => {
				const balance = typeof res[address][1].values[0] !== 'undefined' ? res[address][1].values[0] : BigNumber.from(0)
				const decimals = Config.lendMarkets[marketName].assets.find(asset => asset.marketAddress[chainId] === address).underlyingDecimals
				return {
					address,
					symbol: res[address][0].values[0],
					balance: balance,
					decimals,
				}
			})
		},
		{
			enabled,
		},
	)

	return balances
}
