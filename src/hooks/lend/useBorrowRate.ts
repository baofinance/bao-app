import { BigNumber } from 'ethers'
import MultiCall from '@/utils/multicall'
import useBao from '../base/useBao'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import Config from '@/bao/lib/config'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'

export const useBorrowRate = (marketName: string): BigNumber => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]

	const enabled = !!market && !!bao && !!account
	const { data: borrowRate } = useQuery({
		queryKey: ['@/hooks/lend/borrowRate', providerKey(library, account, chainId), { enabled, marketName }],

		queryFn: async () => {
			const address = market.marketAddresses[chainId]
			const contracts: Contract[] = [Ctoken__factory.connect(address, library)]
			const multiCallContext = MultiCall.createCallContext(
				contracts.map(contract => ({
					ref: contract.address,
					contract: contract,
					calls: [{ method: 'borrowRatePerBlock' }],
				})),
			)
			const res = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))

			return res[address][0].values[0]
		},

		enabled,
	})

	return borrowRate
}
