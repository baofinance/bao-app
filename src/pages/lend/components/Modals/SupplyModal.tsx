/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault, Asset, Balance } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useState } from 'react'
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
	fullBalance: Balance
}

const SupplyModal = ({ asset, show, onHide, marketName, fullBalance }: SupplyModalProps) => {
	const [val, setVal] = useState('0')
	const operation = 'Supply'

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance.balance.toString())
	}, [fullBalance, setVal])

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

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
								{fullBalance && getDisplayBalance(fullBalance.balance, fullBalance.decimals)}{' '}
								<span className='hover:text-baoRed'>{asset.name}</span>
							</Typography>
						</div>
					</div>
					<Typography variant='lg' className='py-5 w-full text-center font-bakbak'>
						<Input
							onSelectMax={handleSelectMax}
							onChange={handleChange}
							value={val}
							max={fullBalance && fullBalance.balance.toString()}
							symbol={asset.name}
							className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
						/>
					</Typography>
				</div>
			</Modal.Body>
			<Modal.Actions>
				<SupplyButton
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

export default SupplyModal
