/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset, Balance } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import Input from '@/components/Input'
import { decimate, exponentiate, getDisplayBalance, sqrt } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useExchangeRates } from '@/hooks/lend/useExchangeRate'
import { parseUnits } from 'ethers/lib/utils'
import WithdrawButton from '@/pages/lend/components/Buttons/WithdrawButton'
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'
import { useComptrollerData } from '@/hooks/lend/useComptrollerData'
import Loader from '@/components/Loader'
import { useAccountLiquidity } from '@/hooks/lend/useAccountLiquidity'
import { useBorrowBalances } from '@/hooks/lend/useBorrowBalances'
import { useOraclePrice } from '@/hooks/lend/useOraclePrice'
import { useOraclePrices } from '@/hooks/lend/useOraclePrices'

export type WithdrawModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
}

const WithdrawModal = ({ asset, show, onHide, marketName }: WithdrawModalProps) => {
	const { chainId } = useWeb3React()
	const supplyBalances = useSupplyBalances(marketName)
	const borrowBalances = useBorrowBalances(marketName)
	const { exchangeRates } = useExchangeRates(marketName)
	const [val, setVal] = useState(BigNumber.from(0))
	const [formattedVal, setFormattedVal] = useState('0.00')
	const operation = 'Withdraw'
	const comptrollerData = useComptrollerData(marketName)
	const accountLiquidity = useAccountLiquidity(marketName)
	const prices = useOraclePrices(marketName)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			const value = e.currentTarget.value

			setFormattedVal(value)

			if (!value || isNaN(Number(value))) {
				return
			}

			setVal(parseUnits(value, asset.underlyingDecimals))
		},
		[setVal, setFormattedVal, asset],
	)

	const supply = useMemo(() => {
		return supplyBalances?.find(supply => supply.address === asset.marketAddress[chainId]) || null
	}, [supplyBalances, asset, chainId])

	const formattedSupplied = useMemo(() => {
		if (!supply) return null
		return getDisplayBalance(supply.balance, asset.underlyingDecimals)
	}, [supply, asset, chainId])

	const assetComptrollerData = useMemo(() => {
		return comptrollerData?.find(data => data.address === asset.marketAddress[chainId]) || null
	}, [comptrollerData, asset])

	const imfFactor = useMemo(() => {
		if (!assetComptrollerData || !accountLiquidity || !supply) return null

		const imfFactor = assetComptrollerData.imfFactor

		if (accountLiquidity) {
			const sqrtBalance = sqrt(supply.balance)
			const num = exponentiate(parseUnits('1.1'))
			const denom = decimate(imfFactor.mul(sqrtBalance).add(parseUnits('1')))
			return num.div(denom)
		}
		return imfFactor
	}, [supply, assetComptrollerData, accountLiquidity])

	const price = useMemo(() => {
		return prices?.[asset.marketAddress[chainId]] || null
	}, [prices, asset, chainId])

	const withdrawable = useMemo(() => {
		if (!assetComptrollerData || !accountLiquidity || !imfFactor || !price) return BigNumber.from(0)

		const collateralFactor = assetComptrollerData.collateralFactor
		const borrowable = accountLiquidity.borrowable

		if (imfFactor.gt(collateralFactor) && price.gt(0)) {
			const factor = collateralFactor.mul(price).gt(0) ? decimate(collateralFactor.mul(price)) : decimate(imfFactor).mul(price)
			return exponentiate(borrowable).div(factor)
		}

		return BigNumber.from(0)
	}, [assetComptrollerData, accountLiquidity, imfFactor, price])

	const max = useMemo(() => {
		if (!accountLiquidity || !withdrawable || !supply) return BigNumber.from(0)

		return !(accountLiquidity && accountLiquidity.borrowable) || withdrawable.gt(supply.balance) ? supply.balance : withdrawable
	}, [accountLiquidity, withdrawable, supply])

	const formattedMax = useMemo(() => {
		return getDisplayBalance(max)
	}, [max])

	const handleSelectMax = useCallback(() => {
		setVal(max)
		setFormattedVal(formattedMax)
	}, [max])

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	const disabled = useMemo(() => {
		return val.eq(BigNumber.from(0))
	}, [val])

	return (
		<>
			<Modal isOpen={show} onDismiss={hideModal}>
				<Modal.Header onClose={hideModal}>
					<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
						<Typography variant='xl' className='mr-1 inline-block'>
							Withdraw {asset.name}
						</Typography>
						<Image src={asset.icon} width={32} height={32} alt={asset.name} />
					</div>
				</Modal.Header>
				<>
					<Modal.Body>
						<div className='mb-4 flex h-full flex-col items-center justify-center'>
							<div className='flex w-full flex-row'>
								<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Withdrawable:
									</Typography>
									<Typography variant='sm' className='font-bakbak'>
										{formattedSupplied ? formattedSupplied : <Loader />}
										<Image src={asset.icon} width={32} height={32} alt={asset.name} className='inline p-1' />
										<span className='hover:text-baoRed'>{asset.name}</span>
									</Typography>
								</div>
							</div>
							<Typography variant='lg' className='py-5 w-full text-center font-bakbak'>
								<Input
									onSelectMax={handleSelectMax}
									onChange={handleChange}
									value={formattedVal}
									max={formattedMax}
									symbol={asset.name}
									className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
								/>
							</Typography>
						</div>
					</Modal.Body>
					<Modal.Actions>
						<WithdrawButton asset={asset} val={val} isDisabled={disabled} onHide={onHide} marketName={marketName} />
					</Modal.Actions>
				</>
			</Modal>
		</>
	)
}

export default WithdrawModal
