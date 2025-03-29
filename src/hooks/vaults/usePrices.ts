import Config from '@/bao/lib/config'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import type { VaultOracle } from '@/typechain/index'
import MultiCall from '@/utils/multicall'
import { exponentiate } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'
import { parseUnits } from 'ethers/lib/utils'

type VaultPrices = { prices: { [key: string]: BigNumber } }

export const usePrice = () => {
	const url = `https://coins.llama.fi/prices/current/ethereum:0xce391315b414d4c7555956120461d21808a69f3a?searchWidth=4h
`

	const { data: price } = useQuery(
		['@/hooks/vaults/usePrice'],
		async () => {
			const res = await (await fetch(url)).json()

			return Object.keys(res).reduce((prev, cur) => ({ ...prev, price: parseUnits(res.coins[cur].price.toString()) }), {})
		},
		{
			retry: true,
			retryDelay: 1000 * 60,
			staleTime: 1000 * 60 * 60,
			cacheTime: 1000 * 60 * 120,
			refetchOnReconnect: false,
			refetchInterval: 1000 * 60 * 5,
			keepPreviousData: true,
			placeholderData: BigNumber.from(0),
		},
	)

	return price
}
export const useVaultPrices = (vaultName: string): VaultPrices => {
	const bao = useBao()
	const { chainId } = useWeb3React()

	const oracle = useContract<VaultOracle>('VaultOracle', Config.vaults[vaultName].oracle)

	const enabled = !!bao && !!oracle && !!chainId
	const { data: prices, refetch } = useQuery(
		['@/hooks/vaults/useVaultPrices', { enabled, vaultName }],
		async () => {
			const tokens = Config.vaults[vaultName].markets.map(vault => vault.vaultAddresses[chainId])
			const multiCallContext = MultiCall.createCallContext([
				{
					ref: 'VaultOracle',
					contract: oracle,
					calls: tokens.map(token => ({ ref: token, method: 'getUnderlyingPrice', params: [token] })),
				},
			])
			const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))
			return data['VaultOracle'].reduce(
				(_prices: { [key: string]: { usd: number } }, result: any) => ({ ..._prices, [result.ref]: exponentiate(result.values[0]) }),
				{},
			)
		},
		{ enabled },
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return { prices }
}
