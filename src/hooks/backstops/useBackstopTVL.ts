import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { useBlockUpdater } from '../base/useBlock'
import usePrice from '../base/usePrice'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'
import { formatUnits } from 'ethers/lib/utils'

import { useEffect, useState } from 'react'

export const useBackstopTVL = (backstop: ActiveSupportedBackstop) => {
	const { library } = useWeb3React()
	const enabled = !!backstop && !!library
	const [ethPrice, setEthPrice] = useState(null)

	const _ethPrice = usePrice('ethereum')

	useEffect(() => {
		const fetchPrice = async () => {
			setEthPrice(_ethPrice)
		}
		fetchPrice()
	}, [_ethPrice])

	const { data: tvlData, refetch } = useQuery(
		['@/hooks/gauges/useBackstopTVL', providerKey(library), { enabled, pid: backstop.pid }],
		async () => {
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
		{
			enabled: !!ethPrice && enabled,
			placeholderData: {
				tvl: 0,
			},
		},
	)

	useEffect(() => {
		if (ethPrice) {
			refetch()
		}
	}, [ethPrice, refetch])

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return tvlData
}
