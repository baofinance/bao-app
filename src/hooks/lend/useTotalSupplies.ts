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
import { BigNumber } from '@ethersproject/bignumber'

export const useTotalSupplies = (marketName: string): TotalSupply[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: totalSupplies, refetch } = useQuery(
		['@/hooks/lend/useTotalSupplies', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const tokens = Config.lendMarkets[marketName].assets.map(asset => asset.marketAddress[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'symbol' }, { method: 'totalSupply' }, { method: 'exchangeRateStored' }, { method: 'decimals' }],
						})),
					),
				),
			)

			return Object.keys(res).map(address => {
				const asset = Config.lendMarkets[marketName].assets.find(
					asset => asset.marketAddress[chainId].toLowerCase() === address.toLowerCase(),
				)
				const decimals = asset.underlyingDecimals

				const totalSupply = res[address][1].values[0]
				const exchangeRate = res[address][2].values[0]
				const tokenDecimals = res[address][3].values[0]

				// Calculate total supply in underlying tokens
				const totalSupplyUnderlying = totalSupply.mul(exchangeRate).div(BigNumber.from(10).pow(18)) // Exchange rate is scaled by 1e18

				return {
					address,
					symbol: res[address][0].values[0],
					totalSupply: totalSupplyUnderlying,
					decimals,
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

	return totalSupplies || []
}
