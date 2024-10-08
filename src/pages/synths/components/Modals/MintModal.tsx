import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import Image from 'next/future/image'
import { useCallback } from 'react'
import VaultButton from '../VaultButton'

export type MintModalProps = {
	asset: ActiveSupportedVault
	val: BigNumber
	show: boolean
	onHide: () => void
	vaultName: string
}

const MintModal = ({ asset, show, onHide, vaultName, val }: MintModalProps) => {
	const usdValue = val.mul(asset.price)

	const operation = 'Mint'

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header onClose={hideModal}>
				<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
					<Typography variant='xl' className='mr-1 inline-block'>
						Confirm Borrow Amount
					</Typography>
				</div>
			</Modal.Header>
			<Modal.Body>
				<Typography variant='lg' className='p-6 text-center font-bakbak'>
					<Image src={`/images/tokens/${asset.icon}`} width={32} height={32} alt={asset.underlyingSymbol} className='inline p-1' />
					{getDisplayBalance(val, asset.underlyingDecimals).toString()} {asset.underlyingSymbol}{' '}
					<Badge>${getDisplayBalance(decimate(usdValue))}</Badge>
				</Typography>
			</Modal.Body>
			<Modal.Actions>
				<VaultButton
					operation={operation}
					asset={asset}
					val={val ? val : BigNumber.from(0)}
					isDisabled={!val}
					onHide={onHide}
					vaultName={vaultName}
				/>
			</Modal.Actions>
		</Modal>
	)
}

export default MintModal
