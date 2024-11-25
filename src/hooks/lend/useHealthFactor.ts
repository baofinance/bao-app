import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import { exponentiate } from '@/utils/numberFormat'
import Config from '@/bao/lib/config'
import { useOraclePrice } from '@/hooks/lend/useOraclePrice'
import { Comptroller__factory } from '@/typechain/factories'
import { useBorrowBalances } from '@/hooks/lend/useBorrowBalances'

const useHealthFactor = (marketName: string, borrowChange: BigNumber) => {
	const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>()
	const bao = useBao()
	const { account, chainId, library } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const price = useOraclePrice(marketName)
	const signerOrProvider = account ? library.getSigner() : library
	const comptroller = Comptroller__factory.connect(market.comptroller, signerOrProvider)
	const [collateralFactor, setCollateralFactor] = useState(null)
	const borrowBalances = useBorrowBalances(marketName)

	const fetchHealthFactor = useCallback(async () => {
		if (Object.keys(borrowBalances).length === 0) return setHealthFactor(BigNumber.from(0))

		let collateralSummation = BigNumber.from(0)
		market.assets.map(
			asset =>
				(collateralSummation = collateralSummation
					.div(BigNumber.from(10).pow(18))
					.mul(parseUnits(borrowBalances.find(balance => balance.address === asset.marketAddress[chainId]).balance.toString()))
					.div(BigNumber.from(10).pow(18))
					.mul(parseUnits(collateralFactor[1].toString()))),
		)

		try {
			const _healthFactor = collateralSummation.div(exponentiate(borrowChange).toString())
			setHealthFactor(_healthFactor)
		} catch {
			setHealthFactor(BigNumber.from(0))
		}
	}, [market, price, borrowChange, borrowBalances, chainId, collateralFactor])

	const fetchCollateralFactor = useCallback(async () => {
		try {
			const _collateralFactor = await comptroller.callStatic.markets(market.marketAddresses[chainId])
			setCollateralFactor(_collateralFactor)
		} catch {
			// Intentionally left empty
		}
	}, [comptroller, chainId, market.marketAddresses])

	useEffect(() => {
		if (!!comptroller && !collateralFactor) fetchCollateralFactor()
	}, [comptroller, collateralFactor, fetchCollateralFactor]) // Added collateralFactor to dependencies

	useEffect(() => {
		if (!!market && !!collateralFactor && !!borrowBalances && !!bao && !!account && !!price && !healthFactor) fetchHealthFactor()
	}, [collateralFactor, borrowBalances, price, market, bao, account, healthFactor, fetchHealthFactor]) // Added healthFactor to dependencies

	return healthFactor
}

export default useHealthFactor
