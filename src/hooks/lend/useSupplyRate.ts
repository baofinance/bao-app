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

export const useSupplyRate = (marketName: string): Record<string, BigNumber> => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: supplyRates, refetch } = useQuery(
		['@/hooks/lend/useSupplyRate', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const assets = Config.lendMarkets[marketName].assets
			const contracts: Contract[] = assets.map(asset => Ctoken__factory.connect(asset.marketAddress[chainId], library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'supplyRatePerBlock' }],
						})),
					),
				),
			)

			// Convert block rate to APR
			// APR = Rate per block * blocks per day * days per year
			const BLOCKS_PER_DAY = 7200 // ~12 seconds per block
			const DAYS_PER_YEAR = 365
			const SCALE = BigNumber.from(10).pow(18)

			return Object.keys(res).reduce(
				(acc, address) => {
					const ratePerBlock = res[address][0].values[0]
					const apr = ratePerBlock.mul(BLOCKS_PER_DAY).mul(DAYS_PER_YEAR).div(SCALE)
					acc[address] = apr
					return acc
				},
				{} as Record<string, BigNumber>,
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return supplyRates || {}
}
