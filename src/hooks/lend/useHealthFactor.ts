import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import { useAccountLiquidity } from './useAccountLiquidity'
import { exponentiate } from '@/utils/numberFormat'
import Config from '@/bao/lib/config'
import { Balance } from '@/bao/lib/types'
import { useOraclePrice } from '@/hooks/lend/useOraclePrice'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/Comptroller'

const useHealthFactor = (marketName: string, borrowBalances: Balance[], supplyBalances: Balance[], borrowChange: BigNumber) => {
	const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>()
	const bao = useBao()
	const { account, chainId, library } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const accountLiquidity = useAccountLiquidity(marketName, borrowBalances, supplyBalances)
	const price = useOraclePrice(marketName)
	const comptroller = useContract<Comptroller>('Comptroller', market.comptroller)

	const fetchHealthFactor = useCallback(async () => {
		const collateralFactor = await comptroller.markets(market.marketAddresses[chainId])

		if (Object.keys(borrowBalances).length === 0) return setHealthFactor(BigNumber.from(0))

		const collateralSummation = BigNumber.from(price)
			.div(BigNumber.from(10).pow(36 - 18))
			.mul(parseUnits(borrowBalances.find(balance => balance.address === market.marketAddresses[chainId]).balance.toString()))
			.div(BigNumber.from(10).pow(18))
			.mul(parseUnits(collateralFactor[1].toString()))

		try {
			const _healthFactor = collateralSummation.div(exponentiate(borrowChange).toString())
			setHealthFactor(_healthFactor)
		} catch {
			setHealthFactor(BigNumber.from(0))
		}
	}, [market, bao, account, price, borrowChange])

	useEffect(() => {
		if (!(market && accountLiquidity && bao && account && price)) return

		fetchHealthFactor()
	}, [market, accountLiquidity, bao, account, price, fetchHealthFactor, borrowChange])

	return healthFactor
}

export default useHealthFactor
