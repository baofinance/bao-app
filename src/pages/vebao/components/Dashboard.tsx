import Button from '@/components/Button'
import { Icon } from '@/components/Icon'
import Input from '@/components/Input'
import { PendingTransaction } from '@/components/Loader/Loader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import usePrice from '@/hooks/base/usePrice'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGaugeInfo from '@/hooks/gauges/useGaugeInfo'
import useGaugeTVL from '@/hooks/gauges/useGaugeTVL'
import useGauges from '@/hooks/gauges/useGauges'
import useMintable from '@/hooks/gauges/useMintable'
import useRelativeWeight from '@/hooks/gauges/useRelativeWeight'
import useVotingPowerAllocated from '@/hooks/gauges/useVotingPowerAllocated'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useUserSlopes from '@/hooks/vebao/useUserSlopes'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import CountdownTimer from '@/pages/gauges/components/CountdownTimer'
import { GaugeController } from '@/typechain/GaugeController'
import { getDayOffset, getEpochSecondForDay, getWeekDiff } from '@/utils/date'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import Slider from 'rc-slider'
import React, { Fragment, useCallback, useState } from 'react'

export const Dashboard = () => {
	const { account } = useWeb3React()
	const [boost, setBoost] = useState(1)
	const [selectedOption, setSelectedOption] = useState('baoUSD-3CRV')
	const veInfo = useVeInfo()
	const lockInfo = useLockInfo()

	const gauges = useGauges()

	const gauge = gauges.length ? gauges.find(gauge => gauge.name === selectedOption) : gauges.find(gauge => gauge.name === 'baoUSD-3CRV')
	const gaugeInfo = useGaugeInfo(gauge)

	const WEEK = 7 * 86400
	const MAXTIME = 4 * 365 * 86400

	const veBaoEstimate = (amount: number, unlockDate: Date, currentUnlockDate: Date | undefined = undefined) => {
		const rounded = Math.floor(getEpochSecondForDay(unlockDate) / WEEK) * WEEK
		return ((rounded - (currentUnlockDate ? +currentUnlockDate : +new Date()) / 1000) / MAXTIME) * amount
	}

	const currentLockEnd = new Date()
	const [lockTime, setLockTime] = useState<Date>(getDayOffset(new Date(), 365 * 4 - 1))
	const min = currentLockEnd.getUTCHours() < new Date().getUTCHours() ? new Date().getUTCHours() : currentLockEnd.getUTCHours()
	const max = getWeekDiff(currentLockEnd, getDayOffset(new Date(), 365 * 4 - 7))
	const [weeks, setWeeks] = useState<number>(max)

	const onCalcSliderChange = (value: number | number[]) => {
		setWeeks(value as number)
		setLockTime(getDayOffset(currentLockEnd, (value as number) * 7))
	}

	const { pendingTx, handleTx, txHash } = useTransactionHandler()
	const gaugeControllerContract = useContract<GaugeController>('GaugeController')

	const { gaugeTVL } = useGaugeTVL(gauge)
	const [baoAmount, setBaoAmount] = useState('')
	const [depositAmount, setDepositAmount] = useState('')
	const veEstimate = veBaoEstimate(parseFloat(baoAmount), lockTime)
	const totalVePower = veInfo?.totalSupply ? parseFloat(formatUnits(veInfo.totalSupply)) : 0
	const tvl = gaugeTVL ? parseFloat(formatUnits(gaugeTVL)) : 0
	const votingPowerAllocated = useVotingPowerAllocated()

	const baoPrice = usePrice('bao-finance-v2')
	const mintable = useMintable()
	const { currentWeight, futureWeight } = useRelativeWeight(gauge.gaugeAddress)
	const rewardsValue = baoPrice ? baoPrice.mul(mintable) : BigNumber.from(0)
	const currentAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(currentWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)
	const futureAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(futureWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)

	const userSlopes = useUserSlopes(gauge)
	const [val, setVal] = useState<string | number>(
		userSlopes && BigNumber.from(userSlopes.power) !== BigNumber.from(0) ? userSlopes.power.div(100).toString() : '0',
	)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleBaoChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setBaoAmount(e.currentTarget.value)
		},
		[setBaoAmount],
	)

	const handleDepositChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setDepositAmount(e.currentTarget.value)
		},
		[setDepositAmount],
	)

	const calc = async () => {
		const [_, boost] = await updateLiquidityLimit(depositAmount, veEstimate, totalVePower, tvl)
		setBoost(boost)
	}

	const updateLiquidityLimit = async (depositAmount: string, veEstimate: number, totalVePower: number, tvl: number) => {
		const l = parseFloat(depositAmount) * 1e18
		const lim = (l * 40) / 100
		const working_balances = gaugeInfo && account ? parseFloat(depositAmount) * 1e18 : 1 * 1e18 //determine workingBalance of depositAmount
		const working_supply = gaugeInfo && parseFloat(gaugeInfo.workingSupply.toString())
		const L = tvl + l
		const veBAO = veEstimate * 1e18
		const limplus = lim + (L * veBAO * 60) / (totalVePower * 1e20)
		const limfinal = Math.min(l, limplus)
		const old_bal = working_balances
		const noboost_lim = (l * 40) / 100
		const noboost_supply = working_supply + noboost_lim - old_bal
		const _working_supply = working_supply + limfinal - old_bal
		const boost = limfinal / _working_supply / (noboost_lim / noboost_supply)

		return [_working_supply, boost]
	}

	return (
		<div>
			<Typography variant='xl' className='mb-6 mt-6 text-center font-bakbak'>
				Voting Dashboard
			</Typography>
			<div className={`glassmorphic-card flex gap-4 rounded border bg-opacity-80 p-6 lg:hidden`}>
				<Icon icon='warning' className='h-8 w-8 flex-none' />
				<div className='m-0 flex-auto'>
					<Typography className='m-0'>Please visit the desktop version of the app to vote on gauges.</Typography>
				</div>
			</div>
			<div className={`glassmorphic-card hidden w-full justify-evenly gap-4 rounded border bg-opacity-80 p-8 lg:block`}>
				<div className='grid grid-cols-4 gap-4'>
					<div className='col-span-1 text-center'>
						<Typography className='font-bakbak text-sm text-baoRed'>Select Gauge</Typography>
						<Listbox value={selectedOption} onChange={setSelectedOption}>
							{({ open }) => (
								<>
									<div>
										<div className='inline-flex rounded-md border-none shadow-sm'>
											<div className='inline-flex rounded-md border-none shadow-sm'>
												<Listbox.Button
													className={
														(classNames(open ? 'bg-baoBlack text-baoRed' : 'text-baoWhite'),
														'inline-flex items-center rounded-full bg-baoWhite bg-opacity-10 font-bakbak text-sm text-baoWhite hover:bg-baoRed hover:bg-opacity-60')
													}
												>
													<div className='inline-flex items-center rounded-l-full border-0 py-2 pl-4 pr-4 text-baoWhite shadow-sm'>
														{selectedOption === '' ? (
															<Typography>Select a gauge</Typography>
														) : (
															<div className='mx-0 my-auto inline-block h-full items-center'>
																<div className='mr-2 inline-block'>
																	<Image
																		className='z-10 inline-block select-none'
																		src={gauge.iconA}
																		alt={gauge.symbol}
																		width={24}
																		height={24}
																	/>
																	<Image
																		className='z-20 -ml-2 inline-block select-none'
																		src={gauge.iconB}
																		alt={gauge.symbol}
																		width={24}
																		height={24}
																	/>
																</div>
																<span className='inline-block text-left align-middle'>
																	<Typography className='font-bakbak'>{gauge.name}</Typography>
																	<Typography variant='sm' className={`font-bakbak text-baoRed`}>
																		{gauge.type.toLowerCase() === 'curve' ? (
																			<Image
																				src='/images/platforms/Curve.png'
																				height={12}
																				width={12}
																				alt='Curve'
																				className='-mt-1 mr-1 inline'
																			/>
																		) : gauge.type.toLowerCase() === 'uniswap' ? (
																			<Image
																				src='/images/platforms/Uniswap.png'
																				height={12}
																				width={12}
																				alt='Uniswap'
																				className='-mt-1 mr-1 inline'
																			/>
																		) : gauge.type.toLowerCase() === 'balancer' ? (
																			<Image
																				src='/images/platforms/Balancer.png'
																				height={12}
																				width={12}
																				alt='Balancer'
																				className='-mt-1 mr-1 inline'
																			/>
																		) : (
																			<Image
																				src='/images/platforms/Saddle.png'
																				height={12}
																				width={12}
																				alt='Saddle'
																				className='-mt-1 mr-1 inline'
																			/>
																		)}
																		{gauge.type}
																	</Typography>
																</span>
															</div>
														)}
													</div>

													<ChevronDownIcon className='m-auto mr-4 h-6 w-6 text-baoRed' aria-hidden='true' />
												</Listbox.Button>
											</div>
										</div>
										<Transition
											show={open}
											as={Fragment}
											leave='transition ease-in duration-100'
											leaveFrom='opacity-100'
											leaveTo='opacity-0'
										>
											<Listbox.Options className='absolute z-10 ml-16 origin-top-right overflow-hidden rounded-3xl bg-baoBlack p-2 shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none'>
												{gauges.length ? (
													gauges.map((gauge: any, i: number) => (
														<Listbox.Option
															key={gauge.name}
															className={({ active }) =>
																classNames(
																	active ? 'border !border-baoRed bg-baoWhite bg-opacity-5 text-baoRed' : 'text-baoWhite',
																	'cursor-pointer select-none rounded-3xl border border-baoBlack p-4 text-sm',
																)
															}
															value={gauge.name}
														>
															{({ selected, active }) => (
																<div className='mx-0 my-auto inline-block h-full items-center'>
																	<div className='mr-2 inline-block'>
																		<Image
																			className='z-10 inline-block select-none'
																			src={gauge.iconA}
																			alt={gauge.symbol}
																			width={24}
																			height={24}
																		/>
																		<Image
																			className='z-20 -ml-2 inline-block select-none'
																			src={gauge.iconB}
																			alt={gauge.symbol}
																			width={24}
																			height={24}
																		/>
																	</div>
																	<span className='inline-block text-left align-middle'>
																		<Typography className='font-bakbak'>{gauge.name}</Typography>
																		<Typography variant='sm' className={`font-bakbak text-baoRed`}>
																			{gauge.type.toLowerCase() === 'curve' ? (
																				<Image
																					src='/images/platforms/Curve.png'
																					height={12}
																					width={12}
																					alt='Curve'
																					className='-mt-1 mr-1 inline'
																				/>
																			) : gauge.type.toLowerCase() === 'uniswap' ? (
																				<Image
																					src='/images/platforms/Uniswap.png'
																					height={12}
																					width={12}
																					alt='Uniswap'
																					className='-mt-1 mr-1 inline'
																				/>
																			) : gauge.type.toLowerCase() === 'balancer' ? (
																				<Image
																					src='/images/platforms/Balancer.png'
																					height={12}
																					width={12}
																					alt='Balancer'
																					className='-mt-1 mr-1 inline'
																				/>
																			) : (
																				<Image
																					src='/images/platforms/Saddle.png'
																					height={12}
																					width={12}
																					alt='Saddle'
																					className='-mt-1 mr-1 inline'
																				/>
																			)}
																			{gauge.type}
																		</Typography>
																	</span>
																</div>
															)}
														</Listbox.Option>
													))
												) : (
													<Typography>Select a gauge</Typography>
												)}
											</Listbox.Options>
										</Transition>
									</div>
								</>
							)}
						</Listbox>
					</div>
					<div className='col-span-1 mt-6 flex items-center justify-center text-center align-middle'>
						<div className='m-auto'>
							<div className='text-center'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Voting Period Ends
								</Typography>
							</div>
							<div className='font-bakbak text-lg'>
								<CountdownTimer />
							</div>
						</div>
					</div>
					<div className='col-span-1 mt-6 flex items-center justify-center text-center align-middle'>
						<div className='m-auto align-middle'>
							<div className='text-center'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Total Voting Power Allocated
								</Typography>
							</div>
							<Typography variant='lg' className='font-bakbak'>
								{(votingPowerAllocated ? votingPowerAllocated.div(BigNumber.from(100)) : BigNumber.from(0)).toString()}%
							</Typography>
						</div>
					</div>
					<div className='col-span-1 mt-6 flex items-center justify-center text-center align-middle'>
						<div className='m-auto align-middle'>
							<div className='text-center'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Allocated to {gauge.symbol}
								</Typography>
							</div>
							<Typography variant='lg' className='font-bakbak'>
								{(userSlopes ? userSlopes.power.div(BigNumber.from(100)) : BigNumber.from(0)).toString()}%
							</Typography>
						</div>
					</div>
				</div>
				{/* End of Header Section */}
				{/* Start of Gauge Stats Section */}
				<div className='mt-8 grid grid-cols-6 gap-4'>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='sm' className='font-bakbak text-baoRed'>
								Gauge TVL
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bakbak'>
							${gaugeTVL ? getDisplayBalance(decimate(gaugeTVL)) : '0'}
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='sm' className='font-bakbak text-baoRed'>
								Total veBAO Allocated
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bakbak'>
							{veInfo ? (parseFloat(formatUnits(veInfo.totalSupply)) * parseFloat(formatUnits(currentWeight))).toLocaleString() : '0'}
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='sm' className='font-bakbak text-baoRed'>
								Current Weight
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bakbak'>
							{getDisplayBalance(currentWeight.mul(100), 18, 2)}%
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='sm' className='font-bakbak text-baoRed'>
								Current APR
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bakbak'>
							{getDisplayBalance(currentAPR)}%
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='sm' className='font-bakbak text-baoRed'>
								Future Weight
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bakbak'>
							{getDisplayBalance(futureWeight.mul(100), 18, 2)}%
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='sm' className='font-bakbak text-baoRed'>
								Future APR
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bakbak'>
							{getDisplayBalance(futureAPR)}%
						</Typography>
					</div>
				</div>
				{/* End of Gauge Stats Section */}
				{/* Start of Voting Slider Section */}
				<div className={`mx-auto my-0 mt-4 flex basis-[40%] flex-col text-left`}>
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
							className='h-2 w-full appearance-none rounded-3xl bg-baoWhite bg-opacity-20 disabled:cursor-not-allowed'
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
							className='relative -mr-1 h-6 w-12
				appearance-none rounded-3xl border-solid border-inherit bg-baoBlack bg-opacity-0 pl-2 
				text-end align-middle font-bakbak text-lg outline-none outline
				 outline-2 outline-offset-2 transition-all duration-200 disabled:text-baoWhite'
						/>
						<Typography variant='lg' className='m-0 p-0 font-bakbak'>
							%
						</Typography>
						<>
							{pendingTx ? (
								<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
									<Button className='ml-8 w-[20%] !rounded-full'>
										<PendingTransaction />
									</Button>
								</a>
							) : (
								<Button
									className='ml-8 w-[20%]'
									disabled={!val || isNaN(val as any) || (lockInfo && lockInfo.balance.eq(0))}
									onClick={async () => {
										const voteTx = gaugeControllerContract.vote_for_gauge_weights(gauge.gaugeAddress, BigNumber.from(val).mul(100))
										handleTx(voteTx, `${gauge.name} Gauge: Voted ${parseFloat(BigNumber.from(val).toString()).toFixed(2)}% of your veBAO`)
									}}
								>
									Vote
								</Button>
							)}
						</>
					</div>
				</div>
				{/* End of Voting Slider Section */}
				<div className='m-4' />
				{/* Start of BoostCalc Section */}
				<Typography variant='xl' className='mb-2 mt-4 font-bakbak'>
					Boost Calculator
				</Typography>
				<div className='mt-4 grid grid-cols-6 gap-4'>
					<div className='col-span-2'>
						<label className='font-bakbak text-sm text-baoRed'>Deposit Amount</label>
						<Input value={depositAmount} onChange={handleDepositChange} />
					</div>
					<div className='col-span-2'>
						<label className='font-bakbak text-sm text-baoRed'>BAO Tokens</label>
						<Input value={baoAmount} onChange={handleBaoChange} />
					</div>
					<div className='col-span-2'>
						<div className='w-full'>
							<label className='float-left mb-2 font-bakbak text-sm text-baoRed'>Lock until</label>
							<label className='float-right mb-2 font-bakbak text-sm text-baoWhite'>{new Date(lockTime).toDateString()}</label>
						</div>
						<div className='p-4'>
							<Slider
								defaultValue={min}
								min={min}
								max={max}
								value={weeks}
								onChange={onCalcSliderChange}
								className='mt-6'
								handleStyle={{
									backgroundColor: '#e21a53',
									borderColor: '#e21a53',
									boxShadow: 'none',
									opacity: 1,
								}}
								trackStyle={{
									backgroundColor: '#e21a53',
									borderColor: '#e21a53',
								}}
								railStyle={{
									backgroundColor: '#faf2e340',
								}}
							/>
						</div>
					</div>
				</div>
				<div className='mt-4 grid grid-cols-8 gap-4'>
					<div className='col-span-2'>
						<Button onClick={calc}>Calculate</Button>
					</div>
					<div className='col-span-2 justify-center text-center'>
						<label className='font-bakbak text-sm text-baoRed'>veBAO</label>
						<div className='flex h-8 gap-2 rounded-md !text-center'>
							<Typography variant='lg' className='inline-block w-full !text-center font-bakbak'>
								{isNaN(veBaoEstimate(parseFloat(baoAmount), lockTime))
									? 0
									: veBaoEstimate(parseFloat(baoAmount), lockTime).toLocaleString()}
							</Typography>
						</div>
					</div>
					<div className='col-span-2 h-12 text-center'>
						<label className='font-bakbak text-sm text-baoRed'>Boost</label>
						<div className='flex w-full gap-2 rounded-md'>
							<Typography variant='lg' className='inline-block w-full !text-center font-bakbak'>
								{`${Math.min(boost < 0 ? 2.5 : boost, 2.5).toFixed(2)}`}
								<Typography variant='lg' className='inline-block text-baoRed'>
									x
								</Typography>
							</Typography>
						</div>
					</div>
					<div className='col-span-2 h-12 text-center'>
						<label className='font-bakbak text-sm text-baoRed'>
							Boosted APR <Tooltipped content='Based on selected gauges current APR and calculated boost.' placement='top' />
						</label>
						<div className='flex w-full gap-2 rounded-md'>
							<Typography variant='lg' className='inline-block w-full !text-center font-bakbak'>
								{getDisplayBalance(parseFloat(currentAPR.toString()) * boost)}%
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
