import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'
import { formatUnits } from 'ethers/lib/utils'
import { useEffect } from 'react'
import useChainlinkOracle from '../base/useChainlinkOracle'

export const useBackstopTVL = (backstop: ActiveSupportedBackstop) => {
	const { library } = useWeb3React()
	const enabled = !!backstop && !!library

	// Use the new Chainlink Oracle hook to get ETH price
	const { price: ethPrice, loading: ethPriceLoading } = useChainlinkOracle('ETH')

	const { data: tvlData, refetch } = useQuery({
		queryKey: ['@/hooks/gauges/useBackstopTVL', providerKey(library), { enabled, pid: backstop.pid }],

		queryFn: async () => {
			if (!ethPrice) {
				return { tvl: 0 }
			}

			const backstopBalance = await backstop.vaultContract.balanceOf(backstop.backstopAddress)
			const exchangeRate = await backstop.vaultContract.exchangeRateStored()
			const totalEth = formatUnits(backstopBalance.mul(exchangeRate), 36)
			console.log('totalEth', totalEth)
			const tvl = parseFloat(formatUnits(ethPrice, 18)) * parseFloat(totalEth)
			console.log(tvl)
			return { tvl }
		},

		enabled: !!ethPrice && enabled,
		placeholderData: { tvl: 0 },
	})

	useEffect(() => {
		if (ethPrice && !ethPriceLoading) {
			refetch()
		}
	}, [ethPrice, ethPriceLoading, refetch])

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return tvlData
}
