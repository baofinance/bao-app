/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { PendingTransaction } from '@/components/Loader/Loader'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/vaults/useApprovals'
import { Erc20 } from '@/typechain/Erc20'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import { useCallback, useState } from 'react'
import VaultButton from '../VaultButton'
import Input from '@/components/Input'

export type SupplyModalProps = {
	asset: ActiveSupportedVault
	show: boolean
	onHide: () => void
	vaultName: string
}

const SupplyModal = ({ asset, show, onHide, vaultName }: SupplyModalProps) => {
	const { pendingTx, txHash, handleTx } = useTransactionHandler()
	const { approvals } = useApprovals(vaultName)
	const { vaultContract } = asset
	const erc20 = useContract<Erc20>('Erc20', asset.underlyingAddress)
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
						Supply {asset.underlyingSymbol}
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
				<VaultButton
					operation={operation}
					asset={asset}
					val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
					isDisabled={!val}
					onHide={onHide}
					vaultName={vaultName}
				/>
			</Modal.Actions>
		</Modal>
	)
}

export default SupplyModal
