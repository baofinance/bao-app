/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback } from 'react'

export type RepayModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
}

const RepayModal = ({ asset, show, onHide, marketName }: RepayModalProps) => {
	const operation = 'Repay'

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<>
			<Modal isOpen={show} onDismiss={hideModal}>
				<Modal.Header onClose={hideModal}>
					<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
						<Typography variant='xl' className='mr-1 inline-block'>
							Repay
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
										Available:
									</Typography>
									<Typography variant='sm' className='font-bakbak'>
										<Image src={asset.icon} width={32} height={32} alt={asset.name} className='inline p-1' />
										{asset.name}
									</Typography>
								</div>
							</div>
						</div>
					</Modal.Body>
					<Modal.Actions></Modal.Actions>
				</>
			</Modal>
		</>
	)
}

export default RepayModal
