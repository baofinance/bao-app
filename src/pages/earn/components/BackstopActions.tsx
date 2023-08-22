//import { useWeb3React } from '@web3-react/core'
import { ActiveSupportedBackstop } from '@/bao/lib/types'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { PendingTransaction } from '@/components/Loader/Loader'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { default as React, useCallback, useMemo, useState } from 'react'

interface StakeProps {
	backstop: ActiveSupportedBackstop
	max: BigNumber
	onHide: () => void
}

export const Stake: React.FC<StakeProps> = ({ backstop, max, onHide }) => {
	const [val, setVal] = useState('')
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(max)
	}, [max])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [fullBalance, setVal])

	const allowance = useAllowance(backstop.vaultAddress, backstop.backstopAddress)

	const hideModal = useCallback(() => {
		onHide()
		setVal('')
	}, [onHide])

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex w-full flex-row'>
						<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
							<Typography variant='sm' className='font-bold text-baoRed'>
								Balance:
							</Typography>
							<Typography variant='sm' className='font-bold'>
								{fullBalance} {backstop.vaultSymbol}
							</Typography>
						</div>
					</div>
					<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} max={fullBalance} symbol={backstop.vaultSymbol} />
				</div>
			</Modal.Body>
			<Modal.Actions>
				{allowance && allowance.lte(0) ? (
					<>
						{pendingTx ? (
							<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
								<Button fullWidth className='!rounded-full'>
									<PendingTransaction /> Pending Transaction
									<FontAwesomeIcon icon={faExternalLink} className='ml-2 text-baoRed' />
								</Button>
							</a>
						) : (
							<Button
								fullWidth
								disabled={max.lte(0)}
								onClick={async () => {
									// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
									const tx = backstop.vaultContract.approve(backstop.backstopAddress, ethers.constants.MaxUint256)
									handleTx(tx, `${backstop.name} Backstop: Approve ${backstop.vaultSymbol}`)
								}}
							>
								Approve {backstop.vaultSymbol}
							</Button>
						)}
					</>
				) : (
					<>
						<Button
							fullWidth
							disabled={!val || isNaN(val as any) || parseUnits(val).gt(max)}
							onClick={async () => {
								const amount = parseUnits(val)
								const depositTx = backstop.backstopContract['deposit(uint256)'](amount)

								handleTx(depositTx, `${backstop.name} Backstop: Stake ${getDisplayBalance(amount)} ${backstop.symbol}`)
							}}
							pendingTx={pendingTx}
							txHash={txHash}
						>
							Stake {backstop.vaultSymbol}
						</Button>
					</>
				)}
			</Modal.Actions>
		</>
	)
}

interface UnstakeProps {
	backstop: ActiveSupportedBackstop
	max: BigNumber
	onHide: () => void
}

export const Unstake: React.FC<UnstakeProps> = ({ backstop, max, onHide }) => {
	const bao = useBao()
	const [val, setVal] = useState('')
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(max)
	}, [max])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [fullBalance, setVal])

	const hideModal = useCallback(() => {
		onHide()
		setVal('')
	}, [onHide])

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex w-full flex-row'>
						<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
							<Typography variant='sm' className='font-bold text-baoRed'>
								Balance:
							</Typography>
							<Typography variant='sm' className='font-bold'>
								{fullBalance} {backstop.backstopSymbol}
							</Typography>
						</div>
					</div>
					<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} max={fullBalance} symbol={backstop.backstopSymbol} />
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					<Button
						fullWidth
						disabled={!val || !bao || isNaN(val as any) || parseFloat(val) > parseFloat(fullBalance)}
						onClick={async () => {
							const amount = parseUnits(val, 18)
							const withdrawTx = backstop.backstopContract['withdraw(uint256)'](amount)
							handleTx(withdrawTx, `${backstop.name} Backstop: Withdraw ${formatUnits(amount)} ${backstop.symbol}`)
						}}
						pendingTx={pendingTx}
						txHash={txHash}
					>
						Withdraw {backstop.backstopSymbol}
					</Button>
				</>
			</Modal.Actions>
		</>
	)
}

interface ActionProps {
	onHide: () => void
	backstop: ActiveSupportedBackstop
	operation: string
}

const Actions: React.FC<ActionProps> = ({ backstop, onHide, operation }) => {
	const tokenBalance = useTokenBalance(backstop?.tokenAddress)
	const vaultBalance = useTokenBalance(backstop?.vaultAddress)
	const backstopBalance = useTokenBalance(backstop?.backstopAddress)

	return (
		<div>
			{operation === 'Stake' && <Stake backstop={backstop} max={vaultBalance} onHide={onHide} />}
			{operation === 'Unstake' && <Unstake backstop={backstop} max={backstopBalance} onHide={onHide} />}
		</div>
	)
}

export default Actions
