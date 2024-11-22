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

export const useBorrowApy = (marketName: string): Record<string, BigNumber | null> => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = Boolean(bao && library && chainId && marketName)
	const { data: borrowApy, refetch } = useQuery(
		['@/hooks/lend/useBorrowApy', providerKey(library, account, chainId), { marketName }],
		async () => {
			const assets = Config.lendMarkets[marketName].assets
			const contracts: Contract[] = assets.map(asset => Ctoken__factory.connect(asset.marketAddress[chainId], library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'borrowRatePerBlock' }],
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
					try {
						const ratePerBlock = BigNumber.from(res[address][0].values[0])
						const apr = ratePerBlock.mul(BLOCKS_PER_DAY).mul(DAYS_PER_YEAR).div(SCALE)
						acc[address.toLowerCase()] = apr
					} catch (error) {
						console.error(`Error calculating APR for ${address}:`, error)
						acc[address.toLowerCase()] = null
					}
					return acc
				},
				{} as Record<string, BigNumber | null>,
			)
		},
		{
			enabled,
			retry: false,
			refetchOnWindowFocus: false,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return borrowApy || {}
}
