/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import { PendingTransaction } from '@/components/Loader/Loader'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useAllowance from '@/hooks/base/useAllowance'
import { useAccountBalances } from '@/hooks/vaults/useBalances'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import { useCallback, useState, useMemo } from 'react'
import VaultButton from '../VaultButton'
import Input from '@/components/Input'
import { Icon } from '@/components/Icon'

export type SupplyModalProps = {
	asset: ActiveSupportedVault
	show: boolean
	onHide: () => void
	vaultName: string
}

const SupplyModal = ({ asset, show, onHide, vaultName }: SupplyModalProps) => {
	const { pendingTx, txHash, handleTx } = useTransactionHandler()
	const [val, setVal] = useState('0')
	const operation = 'Supply'
	const balances = useAccountBalances(vaultName)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	const walletAmount = balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
	const allowance = useAllowance(asset.underlyingAddress, asset.vaultAddress)

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(walletAmount)
	}, [walletAmount])

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [fullBalance, setVal])

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
				<div className='flex w-full flex-row'>
					<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
						<Typography variant='sm' className='font-bold text-baoRed'>
							Balance:
						</Typography>
						<Typography variant='sm' className='font-bold'>
							{getDisplayBalance(walletAmount)} {asset.underlyingSymbol}
						</Typography>
					</div>
				</div>
				<Typography variant='lg' className='py-5 text-center font-bakbak'>
					<Input
						value={val.toString()}
						onChange={handleChange}
						onSelectMax={handleSelectMax}
						max={fullBalance}
						placeholder={`0`}
						className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
						label={
							<div className='flex flex-row items-center pl-2 pr-4'>
								<div className='flex w-6 justify-center'>
									<Image
										src={`/images/tokens/${asset.icon}`}
										width={32}
										height={32}
										alt={asset.symbol}
										className='block h-6 w-6 align-middle'
									/>
								</div>
							</div>
						}
					/>
				</Typography>
			</Modal.Body>
			<Modal.Actions>
				{allowance && allowance.lte(val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)) ? (
					<>
						{pendingTx ? (
							<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
								<Button fullWidth className='!rounded-full'>
									<PendingTransaction /> Pending Transaction
									<Icon icon={faExternalLink} className='ml-2 text-baoRed' />
								</Button>
							</a>
						) : (
							<Button
								fullWidth
								disabled={walletAmount.lte(0)}
								onClick={async () => {
									// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
									const tx = asset.underlyingContract.approve(asset.vaultAddress, ethers.constants.MaxUint256)
									handleTx(tx, `${asset.underlyingSymbol} Token: Approve ${asset.underlyingSymbol}`)
								}}
							>
								Approve {asset.underlyingSymbol}
							</Button>
						)}
					</>
				) : (
					<>
						<VaultButton
							operation={operation}
							asset={asset}
							val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
							isDisabled={!val}
							onHide={onHide}
							vaultName={vaultName}
						/>
					</>
				)}
			</Modal.Actions>
		</Modal>
	)
}

export default SupplyModal
