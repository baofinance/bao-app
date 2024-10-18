/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback, useState } from 'react'
import Input from '@/components/Input'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import BorrowButton from '@/pages/lend/components/Buttons/BorrowButton'

export type BorrowModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
}

const BorrowModal = ({ asset, show, onHide, marketName }: BorrowModalProps) => {
	const [val, setVal] = useState('0')
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

	const handleSelectMax = useCallback(() => {
		return setVal('0')
	}, [])

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
								{'0.00'}
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
