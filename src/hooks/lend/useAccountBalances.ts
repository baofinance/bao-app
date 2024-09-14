import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Erc20__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { Balance } from '@/bao/lib/types'

export const useAccountBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const enabled = !!bao && !!account && !!chainId
	const { data: balances } = useQuery(
		['@/hooks/lend/useAccountBalance', providerKey(library, account, chainId), { enabled }],
		async () => {
			const tokens = Config.lendMarkets[marketName].assets.map(asset => asset.underlyingAddress[chainId])
			const contracts: Contract[] = tokens.filter(address => address !== 'ETH').map(address => Erc20__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(
							contract =>
								contract && {
									ref: contract.address,
									contract,
									calls: [{ method: 'symbol' }, { method: 'decimals' }, { method: 'balanceOf', params: [account] }],
								},
						),
					),
				),
			)
			const ethBalance = await library.getBalance(account)

			return tokens.map(address => {
				const symbol = res[address] ? res[address][0].values[0] : 'ETH'
				const decimals = res[address] ? res[address][1].values[0] : 18
				const balance = res[address] ? res[address][2].values[0] : ethBalance
				return { address, symbol, balance, decimals }
			})
		},
		{
			enabled,
		},
	)

	return balances
}
