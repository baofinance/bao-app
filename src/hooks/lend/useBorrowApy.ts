import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const SECONDS_PER_BLOCK = 12
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: BigNumber) => ((Math.pow((rate.toNumber() / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100).toFixed(18)

export const useBorrowApy = (marketName: string): BigNumber => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: borrowApy, refetch } = useQuery({
		queryKey: ['@/hooks/lend/useBorrowApy', providerKey(library, account, chainId), { enabled, marketName }],

		queryFn: async () => {
			const address = Config.lendMarkets[marketName].marketAddresses[chainId]
			const contracts: Contract[] = [Ctoken__factory.connect(address, library)]

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [
								{ method: 'symbol' },
								{
									method: 'borrowRatePerBlock',
								},
							],
						})),
					),
				),
			)

			return parseUnits(toApy(res[address][1].values[0]).toString())
		},

		enabled,
	})

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return borrowApy
}
