/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault, Asset, Balance } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import SupplyButton from '@/pages/lend/components/Buttons/SupplyButton'
import Image from 'next/future/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { getDisplayBalance } from '@/utils/numberFormat'

export type SupplyModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
	fullBalance: BigNumber
}

const SupplyModal = ({ asset, show, onHide, marketName, fullBalance }: SupplyModalProps) => {
	const [val, setVal] = useState(BigNumber.from(0))
	const [formattedVal, setFormattedVal] = useState('0.00')

	const operation = 'Supply'

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

	const formattedBalance = useMemo(() => {
		if (!fullBalance) return '0'
		return getDisplayBalance(fullBalance)
	}, [fullBalance])

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
		setFormattedVal(getDisplayBalance(fullBalance))
	}, [fullBalance, setVal, setFormattedVal])

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	const disabled = useMemo(() => {
		return val.eq(BigNumber.from(0))
	}, [val])

	return (
		<Modal isOpen={show} onDismiss={() => {}}>
			<Modal.Header onClose={hideModal}>
				<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
					<Typography variant='xl' className='mr-1 inline-block'>
						Supply {asset.name}
					</Typography>
					<Image className='z-10 inline-block select-none duration-200' src={asset.icon} width={32} height={32} alt={asset.name} />
				</div>
			</Modal.Header>
			<Modal.Body>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex w-full flex-row'>
						<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
							<Typography variant='sm' className='font-bold text-baoRed'>
								Balance:
							</Typography>
							<Typography variant='sm' className='font-bold'>
								{formattedBalance}
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
							max={formattedBalance}
							symbol={asset.name}
							className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
						/>
					</Typography>
				</div>
			</Modal.Body>
			<Modal.Actions>
				<SupplyButton asset={asset} val={val} isDisabled={disabled} onHide={onHide} marketName={marketName} />
			</Modal.Actions>
		</Modal>
	)
}

export default SupplyModal
