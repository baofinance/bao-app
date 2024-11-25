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
import { IconProp } from '@fortawesome/fontawesome-svg-core'

interface DepositProps {
	backstop: ActiveSupportedBackstop
	max: BigNumber
	onHide: () => void
	setStep: (step: string) => void
}

export const Deposit: React.FC<DepositProps> = ({ backstop, max, setStep }) => {
	const [val, setVal] = useState('')
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const fullBalance = useMemo(() => {
		return getDisplayBalance(max)
	}, [max])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(formatUnits(max))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fullBalance, setVal])

	const allowance = useAllowance(backstop.tokenAddress, backstop.vaultAddress)

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
								{fullBalance} {backstop.name}
							</Typography>
						</div>
					</div>
					<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} max={fullBalance} symbol={backstop.name} />
				</div>
			</Modal.Body>
			<Modal.Actions>
				{allowance && allowance.lte(0) ? (
					<>
						{pendingTx ? (
							<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
								<Button fullWidth className='!rounded-full'>
									<PendingTransaction /> Pending Transaction
									<FontAwesomeIcon icon={faExternalLink as IconProp} className='ml-2 text-baoRed' />
								</Button>
							</a>
						) : (
							<Button
								fullWidth
								disabled={max.lte(0)}
								onClick={async () => {
									const tx = backstop.tokenContract.approve(backstop.vaultAddress, ethers.constants.MaxUint256)
									handleTx(tx, `${backstop.name} Backstop: Approve ${backstop.name}`)
								}}
							>
								Approve {backstop.name}
							</Button>
						)}
					</>
				) : (
					<>
						<Button
							fullWidth
							disabled={!val || isNaN(val as any) || parseUnits(val).gt(max)}
							onClick={async () => {
								const mintTx = backstop.vaultContract.mint(parseUnits(val), true)
								handleTx(mintTx, `${backstop.name} Backstop: Deposit ${getDisplayBalance(val).toString()} ${backstop.name}`, () =>
									setStep('Stake'),
								)
							}}
						>
							Deposit {backstop.name}
						</Button>
					</>
				)}
			</Modal.Actions>
		</>
	)
}

interface WithdrawProps {
	backstop: ActiveSupportedBackstop
	onHide: () => void
	max: BigNumber
	setStep: (step: string) => void
}

export const Withdraw: React.FC<WithdrawProps> = ({ backstop, onHide, max }) => {
	const bao = useBao()
	const [val, setVal] = useState('')
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

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
								{getDisplayBalance(max)} {backstop.name}
							</Typography>
						</div>
					</div>
					<Input onSelectMax={() => setVal(formatUnits(max))} onChange={handleChange} value={val} symbol={backstop.name} />
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					<Button
						fullWidth
						disabled={!val || !bao || isNaN(val as any) || parseFloat(val) > parseFloat(formatUnits(max))}
						onClick={() => {
							handleTx(
								backstop.vaultContract.redeemUnderlying(parseUnits(val).toString()),
								`${backstop.name} Backstop: Withdraw ${getDisplayBalance(val)} ${backstop.name}`,
								() => onHide(),
							)
						}}
						pendingTx={pendingTx}
						txHash={txHash}
					>
						Withdraw {backstop.name}
					</Button>
				</>
			</Modal.Actions>
		</>
	)
}

interface StakeProps {
	backstop: ActiveSupportedBackstop
	max: BigNumber
	onHide: () => void
	exchangeRate: BigNumber
	setStep: (step: string) => void
}

export const Stake: React.FC<StakeProps> = ({ backstop, max, onHide }) => {
	const [val, setVal] = useState('')
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(max)
	}, [max])

	const displayBalance = max

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
								{getDisplayBalance(displayBalance)} {backstop.vaultSymbol}
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
									<FontAwesomeIcon icon={faExternalLink as IconProp} className='ml-2 text-baoRed' />
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

								handleTx(depositTx, `${backstop.name} Backstop: Stake ${getDisplayBalance(amount)} ${backstop.vaultSymbol}`, () => onHide())
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
	setStep: (step: string) => void
}

export const Unstake: React.FC<UnstakeProps> = ({ backstop, max, setStep }) => {
	const bao = useBao()
	const [val, setVal] = useState('')
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	// console.log('usdToShare', formatUnits(usdToShare))
	const fullBalance = useMemo(() => {
		return getDisplayBalance(max)
	}, [max])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(formatUnits(max))
	}, [max])

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex w-full flex-row'>
						<div className={`float-right mb-1 flex w-full items-center justify-end gap-1 ${max.lte(0) && 'opacity-40'}`}>
							<Typography variant='sm' className='font-bold text-baoRed'>
								Balance:
							</Typography>
							<Typography variant='sm' className='font-bold'>
								{fullBalance} {backstop.backstopSymbol}
							</Typography>
						</div>
					</div>
					<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} symbol={backstop.backstopSymbol} disabled={max.lte(0)} />
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					<Button
						fullWidth
						disabled={!val || !bao || isNaN(val as any) || parseFloat(val) > parseFloat(formatUnits(max))}
						onClick={async () => {
							const amount = parseUnits(val, 18)
							const withdrawTx = backstop.backstopContract['withdraw(uint256)'](amount)
							handleTx(withdrawTx, `${backstop.name} Backstop: Unstake ${formatUnits(amount)} ${backstop.symbol}`, () =>
								setStep('Withdraw'),
							)
						}}
						pendingTx={pendingTx}
						txHash={txHash}
					>
						Unstake {backstop.backstopSymbol}
					</Button>
				</>
			</Modal.Actions>
		</>
	)
}

interface DepositAndStakeProps {
	backstop: ActiveSupportedBackstop
	tokenBalance: BigNumber
	vaultBalance: BigNumber
	exchangeRate: BigNumber
	onHide: () => void
}

const DepositAndStake: React.FC<DepositAndStakeProps> = ({ backstop, onHide, vaultBalance, tokenBalance, exchangeRate }) => {
	const [step, setStep] = useState('Deposit')
	return (
		<div>
			<div className='flex justify-between rounded-full gap-2 px-4'>
				<Button
					size='sm'
					fullWidth
					className={`${step === 'Deposit' && '!bg-baoRed'} !border-none text-xs !h-8`}
					onClick={() => setStep('Deposit')}
				>
					Step 1: Deposit in Vault
				</Button>
				<Button
					size='sm'
					fullWidth
					className={`${step === 'Stake' && '!bg-baoRed'} !border-none text-xs !h-8`}
					onClick={() => setStep('Stake')}
					disabled={vaultBalance.lte(0)}
				>
					Step 2: Stake in Backstop
				</Button>
			</div>
			{step === 'Deposit' && <Deposit backstop={backstop} max={tokenBalance} onHide={onHide} setStep={setStep} />}
			{step === 'Stake' && <Stake backstop={backstop} max={vaultBalance} onHide={onHide} exchangeRate={exchangeRate} setStep={setStep} />}
		</div>
	)
}

interface UnstakeAndWithdrawProps {
	backstop: ActiveSupportedBackstop
	max: BigNumber
	backstopBalance: BigNumber
	onHide: () => void
}

const UnstakeAndWithdraw: React.FC<UnstakeAndWithdrawProps> = ({ backstop, onHide, max, backstopBalance }) => {
	const [step, setStep] = useState('Unstake')
	return (
		<div>
			<div className='flex justify-between rounded-full gap-2 px-4'>
				<Button
					size='sm'
					fullWidth
					className={`${step === 'Unstake' && '!bg-baoRed'} !border-none text-xs !h-8`}
					onClick={() => setStep('Unstake')}
					disabled={backstopBalance.lte(0)}
				>
					Step 1: Unstake from Backstop
				</Button>
				<Button
					size='sm'
					fullWidth
					className={`${step === 'Withdraw' && '!bg-baoRed'} !border-none text-xs !h-8`}
					onClick={() => setStep('Withdraw')}
					disabled={max.lte(0)}
				>
					Step 2: Withdraw from Vault
				</Button>
			</div>
			{step === 'Withdraw' && <Withdraw backstop={backstop} max={max} onHide={onHide} setStep={setStep} />}
			{step === 'Unstake' && <Unstake backstop={backstop} max={backstopBalance} onHide={onHide} setStep={setStep} />}
		</div>
	)
}

interface ActionProps {
	onHide: () => void
	backstop: ActiveSupportedBackstop
	operation: string
	max: BigNumber
	exchangeRate: BigNumber
}

const Actions: React.FC<ActionProps> = ({ backstop, onHide, operation, max, exchangeRate }) => {
	const tokenBalance = useTokenBalance(backstop?.tokenAddress)
	const vaultBalance = useTokenBalance(backstop?.vaultAddress)
	const backstopBalance = useTokenBalance(backstop?.backstopAddress)

	return (
		<div>
			{operation === 'Deposit' && (
				<DepositAndStake
					backstop={backstop}
					tokenBalance={tokenBalance}
					vaultBalance={vaultBalance}
					exchangeRate={exchangeRate}
					onHide={onHide}
				/>
			)}
			{operation === 'Withdraw' && <UnstakeAndWithdraw backstop={backstop} max={max} backstopBalance={backstopBalance} onHide={onHide} />}
		</div>
	)
}

export default Actions
