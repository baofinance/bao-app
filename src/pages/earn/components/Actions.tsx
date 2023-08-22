//import { useWeb3React } from '@web3-react/core'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGaugeInfo from '@/hooks/earn/useGaugeInfo'
import useRelativeWeight from '@/hooks/earn/useRelativeWeight'
import useVotingPowerAllocated from '@/hooks/earn/useVotingPowerAllocated'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useUserSlopes from '@/hooks/vebao/useUserSlopes'
import type { Gauge, GaugeController, Minter } from '@/typechain/index'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLink, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import Link from 'next/link'
import { default as React, useCallback, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import CountdownTimer from './CountdownTimer'
import { PendingTransaction } from '@/components/Loader/Loader'

interface StakeProps {
	gauge: ActiveSupportedGauge
	max: BigNumber
	onHide: () => void
}

export const Stake: React.FC<StakeProps> = ({ gauge, max, onHide }) => {
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

	const allowance = useAllowance(gauge.lpAddress, gauge.gaugeAddress)

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
								{fullBalance}{' '}
								<a href={gauge.pairUrl} target='_blank' rel='noopener noreferrer' className='hover:text-baoRed'>
									{gauge.name} <FontAwesomeIcon icon={faExternalLinkAlt} className='h-3 w-3' />
								</a>
							</Typography>
						</div>
					</div>
					<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} max={fullBalance} symbol={gauge.name} />
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
									const tx = gauge.lpContract.approve(gauge.gaugeAddress, ethers.constants.MaxUint256)
									handleTx(tx, `${gauge.name} Gauge: Approve ${gauge.symbol}`)
								}}
							>
								Approve {gauge.name}
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
								const stakeTx = gauge.gaugeContract['deposit(uint256)'](amount)

								handleTx(stakeTx, `${gauge.name} Gauge: Deposit ${getDisplayBalance(amount)} ${gauge.name}`, () => hideModal())
							}}
							pendingTx={pendingTx}
							txHash={txHash}
						>
							Deposit {gauge.name}
						</Button>
					</>
				)}
			</Modal.Actions>
		</>
	)
}

interface UnstakeProps {
	gauge: ActiveSupportedGauge
	max: BigNumber
	onHide: () => void
}

export const Unstake: React.FC<UnstakeProps> = ({ gauge, max, onHide }) => {
	const bao = useBao()
	const [val, setVal] = useState('')
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const gaugeInfo = useGaugeInfo(gauge)

	const gaugeContract = useContract<Gauge>('Gauge', gauge.gaugeAddress)

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
								{getDisplayBalance(fullBalance, 0)}{' '}
								<Link href={gauge.pairUrl} target='_blank' rel='noopener noreferrer' className='hover:text-baoRed'>
									<a>
										{gauge.name} <FontAwesomeIcon icon={faExternalLinkAlt} className='h-3 w-3' />
									</a>
								</Link>
							</Typography>
						</div>
					</div>
					<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} max={fullBalance} symbol={gauge.name} />
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					<Button
						fullWidth
						disabled={
							!val || !bao || isNaN(val as any) || parseFloat(val) > parseFloat(fullBalance) || gaugeInfo.balance.eq(BigNumber.from(0))
						}
						onClick={async () => {
							const amount = parseUnits(val, 18)
							const unstakeTx = gaugeContract['withdraw(uint256)'](amount)
							handleTx(unstakeTx, `${gauge.name} Gauge: Withdraw ${formatUnits(amount)} ${gauge.name}`, () => hideModal())
						}}
						pendingTx={pendingTx}
						txHash={txHash}
					>
						Withdraw {gauge.name}
					</Button>
				</>
			</Modal.Actions>
		</>
	)
}

interface RewardsProps {
	gauge: ActiveSupportedGauge
}

export const Rewards: React.FC<RewardsProps> = ({ gauge }) => {
	const gaugeInfo = useGaugeInfo(gauge)
	const { pendingTx, txHash, handleTx } = useTransactionHandler()
	const minterContract = useContract<Minter>('Minter')

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex items-center justify-center'>
						<div className='flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full border-0 bg-transparent-100'>
							<Image src='/images/tokens/BAO.png' alt='ETH' width={32} height={32} className='m-auto' />
						</div>
						<div className='ml-2'>
							<Typography variant='xl' className='font-bakbak'>
								{gaugeInfo && getDisplayBalance(gaugeInfo.claimableTokens)}
							</Typography>
						</div>
					</div>
				</div>
			</Modal.Body>
			<Modal.Actions>
				<Button
					fullWidth
					disabled={!gaugeInfo || !gaugeInfo.claimableTokens || gaugeInfo.claimableTokens.lte(0)}
					onClick={async () => {
						const harvestTx = minterContract.mint(gauge.gaugeAddress)
						handleTx(harvestTx, `${gauge.name} Gauge: Harvest ${getDisplayBalance(gaugeInfo && gaugeInfo.claimableTokens)} BAO`)
					}}
					pendingTx={pendingTx}
					txHash={txHash}
				>
					Harvest BAO
				</Button>
			</Modal.Actions>
		</>
	)
}

interface VoteProps {
	gauge: ActiveSupportedGauge
	tvl: BigNumber
	rewardsValue: BigNumber
}

export const Vote: React.FC<VoteProps> = ({ gauge, tvl, rewardsValue }) => {
	const { pendingTx, txHash, handleTx } = useTransactionHandler()
	const gaugeControllerContract = useContract<GaugeController>('GaugeController')
	const lockInfo = useLockInfo()
	const votingPowerAllocated = useVotingPowerAllocated()
	const userSlopes = useUserSlopes(gauge)
	const [val, setVal] = useState(
		userSlopes && BigNumber.from(userSlopes.power) !== BigNumber.from(0) ? userSlopes.power.div(100).toString() : '0',
	)
	const { currentWeight, futureWeight } = useRelativeWeight(gauge.gaugeAddress)

	const currentAPR = tvl && tvl.gt(0) ? rewardsValue.mul(currentWeight).div(tvl).mul(100).toString() : BigNumber.from(0)
	const futureAPR = tvl && tvl.gt(0) ? rewardsValue.mul(futureWeight).div(tvl).mul(100).toString() : BigNumber.from(0)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	return (
		<>
			<Modal.Body>
				<StatBlock
					label='Gauge Info'
					stats={[
						{
							label: 'Current Weight',
							value: `${currentWeight ? getDisplayBalance(currentWeight.mul(100), 18, 4) : BigNumber.from(0)}%`,
						},
						{
							label: 'Current APR',
							value: `${currentAPR ? getDisplayBalance(currentAPR) : BigNumber.from(0)}%`,
						},
						{
							label: 'Future Weight',
							value: `${futureWeight ? getDisplayBalance(futureWeight.mul(100), 18, 4) : BigNumber.from(0)}%`,
						},
						{
							label: 'Future APR',
							value: `${futureAPR ? getDisplayBalance(futureAPR) : BigNumber.from(0)}%`,
						},
						{
							label: 'Voting Ends In',
							value: <CountdownTimer />,
						},
					]}
				/>
				<StatBlock
					className='mt-4'
					label='veBAO Stats'
					stats={[
						{
							label: 'Total Voting Power',
							value: `${lockInfo ? getDisplayBalance(lockInfo.balance, 18, 2) : BigNumber.from(0)}`,
						},
						{
							label: 'Total Allocated',
							value: `${votingPowerAllocated ? votingPowerAllocated.div(BigNumber.from(100)) : BigNumber.from(0)}%`,
						},
						{
							label: `Allocated to ${gauge.name}`,
							value: `${userSlopes ? userSlopes.power.div(100) : BigNumber.from(0)}%`,
						},
					]}
				/>
				<div className='mt-4'>
					<div className='text-center'>
						<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-3 font-bakbak text-baoWhite'>
							Vote
						</Typography>
					</div>
					<div className='flex w-full items-center justify-center gap-2 rounded-md'>
						<input
							type='range'
							id='points'
							defaultValue={
								userSlopes && BigNumber.from(userSlopes.power) !== BigNumber.from(0) ? userSlopes.power.div(100).toString() : val
							}
							disabled={userSlopes && votingPowerAllocated.div(100).eq(100) && userSlopes.power.eq(0)}
							min={0}
							max={
								userSlopes && userSlopes.power.eq(0) && votingPowerAllocated.eq(0)
									? BigNumber.from(100).toString()
									: userSlopes && votingPowerAllocated.div(100).eq(100) && userSlopes.power.eq(0)
									? BigNumber.from(0).toString()
									: userSlopes && votingPowerAllocated.div(100).gt(0)
									? userSlopes && BigNumber.from(100).add(userSlopes.power.div(100)).sub(votingPowerAllocated.div(100)).toString()
									: userSlopes && BigNumber.from(100).add(userSlopes.power.div(100)).sub(userSlopes.power.div(100)).toString()
							}
							value={val}
							className='h-2 w-full appearance-none rounded-full bg-baoWhite bg-opacity-20 accent-baoRed disabled:cursor-not-allowed'
							onChange={handleChange}
							onInput={handleChange}
						/>
						<input
							type='number'
							id='points'
							disabled={true}
							onChange={handleChange}
							placeholder={val.toString()}
							value={val}
							className='relative -mr-1 h-6 w-10 min-w-0 appearance-none
				rounded border-solid border-inherit bg-baoBlack bg-opacity-80 pl-2 text-end 
				align-middle outline-none outline outline-2 outline-offset-2 transition-all
				 duration-200 disabled:text-baoWhite md:text-sm'
						/>
						<Typography variant='sm' className='m-0 mr-2 rounded border-solid border-inherit p-0'>
							%
						</Typography>
					</div>
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					<Button
						fullWidth
						disabled={!val || isNaN(val as any) || (lockInfo && lockInfo.balance.eq(0))}
						onClick={async () => {
							const voteTx = gaugeControllerContract.vote_for_gauge_weights(gauge.gaugeAddress, BigNumber.from(val).mul(100))
							handleTx(voteTx, `${gauge.name} Gauge: Voted ${parseFloat(BigNumber.from(val).toString()).toFixed(2)}% of your veBAO`)
						}}
						pendingTx={pendingTx}
						txHash={txHash}
					>
						Vote for {gauge.name}
					</Button>
				</>
			</Modal.Actions>
		</>
	)
}

interface ActionProps {
	onHide: () => void
	gauge: ActiveSupportedGauge
	tvl: BigNumber
	rewardsValue: BigNumber
	operation: string
}

const Actions: React.FC<ActionProps> = ({ gauge, tvl, rewardsValue, onHide, operation }) => {
	const gaugeInfo = useGaugeInfo(gauge)
	const tokenBalance = useTokenBalance(gauge?.lpAddress)

	return (
		<div>
			{operation === 'Stake' && <Stake gauge={gauge} max={tokenBalance} onHide={onHide} />}
			{operation === 'Unstake' && <Unstake gauge={gauge} max={gaugeInfo && gaugeInfo.balance} onHide={onHide} />}
			{operation === 'Vote' && <Vote gauge={gauge} tvl={tvl} rewardsValue={rewardsValue} />}
			{operation === 'Rewards' && <Rewards gauge={gauge} />}
		</div>
	)
}

export default Actions
