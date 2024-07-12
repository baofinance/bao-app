/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault, Asset } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useState } from 'react'
import MarketButton from '../MarketButton'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import VaultButton from '@/pages/vaults/components/VaultButton'
import SupplyButton from '@/pages/lend/components/Buttons/SupplyButton'

export type SupplyModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
}

const SupplyModal = ({ asset, show, onHide, marketName }: SupplyModalProps) => {
	const [val, setVal] = useState('0')
	const operation = 'Supply'

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

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
				</div>
			</Modal.Header>
			<Modal.Body>
				<Typography variant='lg' className='py-5 text-center font-bakbak'>
					<Input
						value={val.toString()}
						onChange={handleChange}
						onSelectMax={() => {}}
						placeholder={`0`}
						className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
					/>
				</Typography>
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
