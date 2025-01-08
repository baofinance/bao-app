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
import { useBlockUpdater } from '@/hooks/base/useBlock'

export const useTotalDebt = (marketName: string): { marketAddress: string; totalBorrows: BigNumber }[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: totalDebt, refetch } = useQuery(
		['@/hooks/lend/useTotalDebt', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const tokens = market.assets.map(asset => asset.ctokenAddress[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'totalBorrows' }],
						})),
					),
				),
			)

			return Object.keys(res).map(address => ({
				marketAddress: address,
				totalBorrows: res[address][0].values[0],
			}))
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
		},
	)

	useBlockUpdater(refetch, 10)
	useTxReceiptUpdater(refetch)

	return totalDebt || []
}
