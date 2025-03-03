import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useOraclePrices } from './useOraclePrices'
import { decimate, getDisplayBalance } from '../../utils/numberFormat'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useTotalCollateral = (marketName: string): BigNumber => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const prices = useOraclePrices(marketName)

	const enabled = !!bao && !!account && !!chainId && !!prices && !!marketName
	const { data: totalCollateral, refetch } = useQuery(
		['@/hooks/lend/useTotalCollateral', providerKey(library, account, chainId), { enabled, prices, marketName }],
		async () => {
			const addresses = Config.lendMarkets[marketName].assets.map(asset => asset.marketAddress[chainId])
			const contracts: Contract[] = addresses.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [
								{ method: 'symbol' },
								{
									method: 'getCash',
								},
							],
						})),
					),
				),
			)

			let totalCollateral = BigNumber.from(0)
			Object.keys(res).map(
				address => (totalCollateral = totalCollateral.add(decimate(res[address][1].values[0].mul(BigNumber.from(prices[address]))))),
			)

			return totalCollateral
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return totalCollateral
}
