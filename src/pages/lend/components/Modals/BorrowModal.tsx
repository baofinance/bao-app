/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault, Asset } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { PendingTransaction } from '@/components/Loader/Loader'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import { useCallback } from 'react'
import MarketButton from '../MarketButton'

export type BorrowModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
}

const BorrowModal = ({ asset, show, onHide }: BorrowModalProps) => {
	const operation = 'Borrow'

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header onClose={hideModal}>
				<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
					<Typography variant='xl' className='mr-1 inline-block'>
						Borrow
					</Typography>
				</div>
			</Modal.Header>
			<Modal.Body>
				<Typography variant='lg' className='p-6 text-center font-bakbak'>
					<Image src={asset.icon} width={32} height={32} alt={asset.name} className='inline p-1' />
					{asset.name}
				</Typography>
			</Modal.Body>
			<Modal.Actions></Modal.Actions>
		</Modal>
	)
}

export default BorrowModal
