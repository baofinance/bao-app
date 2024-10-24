/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import Input from '@/components/Input'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber, FixedNumber } from 'ethers'
import BorrowButton from '@/pages/lend/components/Buttons/BorrowButton'
import { useActiveLendMarket } from '@/hooks/lend/useActiveLendMarket'
import { useAccountLiquidity } from '@/hooks/lend/useAccountLiquidity'
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'
import { useBorrowBalances } from '@/hooks/lend/useBorrowBalances'
import { decimate, getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { useOraclePrices } from '@/hooks/lend/useOraclePrices'
import { useWeb3React } from '@web3-react/core'

export type BorrowModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
}

const BorrowModal = ({ asset, show, onHide, marketName }: BorrowModalProps) => {
	const { chainId } = useWeb3React()
	const [val, setVal] = useState('0')
	const activeLendMarket = useActiveLendMarket(asset)
	const supplyBalances = useSupplyBalances(marketName)
	const borrowBalances = useBorrowBalances(marketName)
	const accountliquidity = useAccountLiquidity(marketName, supplyBalances, borrowBalances)
	const prices = useOraclePrices(marketName)
	const operation = 'Borrow'

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const borrowable = useMemo(() => {
		if (!prices || !accountliquidity) return null

		const marketPrice = prices[asset.marketAddress[chainId]]
		if (!marketPrice) return null

		return BigNumber.from(FixedNumber.from(formatUnits(accountliquidity.borrowable)).divUnsafe(FixedNumber.from(formatUnits(marketPrice))))q
	}, [accountliquidity, asset, chainId, prices])

	const formattedBorrowable = useMemo(() => {
		return borrowable ? getDisplayBalance(borrowable) : null
	}, [borrowable])

	const handleSelectMax = useCallback(() => {
		setVal(formattedBorrowable || '0.00')
	}, [formattedBorrowable])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header onClose={hideModal}>
				<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
					<Typography variant='xl' className='mr-1 inline-block'>
						Borrow {asset.name}
					</Typography>
					<Image src={asset.icon} width={32} height={32} alt={asset.name} />
				</div>
			</Modal.Header>
			<Modal.Body>
				<div className='mb-4 flex h-full flex-col items-center justify-center'>
					<div className='flex w-full flex-row'>
						<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
							<Typography variant='sm' className='font-bakbak text-baoRed'>
								Available:
							</Typography>
							<Typography variant='sm' className='font-bakbak'>
								{formattedBorrowable ? formattedBorrowable : '0.00'}
								<Image src={asset.icon} width={32} height={32} alt={asset.name} className='inline p-1' />
								<span className='hover:text-baoRed'>{asset.name}</span>
							</Typography>
						</div>
					</div>
					<Typography variant='lg' className='py-5 w-full text-center font-bakbak'>
						<Input
							onSelectMax={handleSelectMax}
							onChange={handleChange}
							value={val}
							max={0}
							symbol={asset.name}
							className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
						/>
					</Typography>
				</div>
			</Modal.Body>
			<Modal.Actions>
				<BorrowButton
					asset={asset}
					val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
					isDisabled={!val}
					onHide={onHide}
					marketName={marketName}
				/>
			</Modal.Actions>
		</Modal>
	)
}

export default BorrowModal
