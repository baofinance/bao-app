import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { NavButtons } from '@/components/Button'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback, useState } from 'react'
import Actions from './BackstopActions'

type BackstopModalProps = {
	backstop: ActiveSupportedBackstop
	show: boolean
	onHide: () => void
}

const BackstopModal: React.FC<BackstopModalProps> = ({ backstop, show, onHide }) => {
	const operations = ['Deposit', 'Withdraw', 'Stake', 'Unstake']
	const [operation, setOperation] = useState(operations[0])

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header
				onClose={hideModal}
				header={
					<>
						<Typography variant='xl' className='mr-1 inline-block'>
							{operation}
						</Typography>
						<Image className='z-10 inline-block select-none duration-200' src={backstop.icon} width={32} height={32} alt={backstop.name} />
					</>
				}
			/>
			<Modal.Options>
				<NavButtons options={operations} active={operation} onClick={setOperation} />
			</Modal.Options>
			<Actions backstop={backstop} onHide={onHide} operation={operation} />
		</Modal>
	)
}

export default BackstopModal
