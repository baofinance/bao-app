import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

export const useBackstopTVL = (backstop: ActiveSupportedBackstop) => {
	const { library } = useWeb3React()
	const enabled = !!backstop && !!library
	const { data: tvlData, refetch } = useQuery(
		['@/hooks/gauges/useBackstopTVL', providerKey(library), { enabled, pid: backstop.pid }],
		async () => {
			const tokenValuePromise = backstop.tokenContract.balanceOf(backstop.vaultAddress)
			const [tokenValue, { succ: success, value: collateralValue }] = await Promise.all([
				tokenValuePromise,
				backstop.backstopContract.getCollateralValue(),
			])

			console.log('tokenValue', formatUnits(tokenValue))

			if (!success) {
				throw new Error('getTvl: failed to fetch collateral value')
			}

			const tvl = tokenValue.add(collateralValue)
			let usdRatio, collRatio

			if (tvl.isZero()) {
				usdRatio = BigNumber.from(0)
				collRatio = BigNumber.from(0)
			} else {
				usdRatio = formatUnits(tokenValue.div(tvl))
				collRatio = formatUnits(collateralValue.div(tvl))
			}

			return {
				tvl,
				usdRatio,
				collRatio,
			}
		},
		{
			enabled,
			placeholderData: {
				tvl: BigNumber.from(0),
				usdRatio: BigNumber.from(0),
				collRatio: BigNumber.from(0),
			},
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return tvlData
}

export default useBackstopTVL
