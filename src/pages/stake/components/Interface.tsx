import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber, Contract, ethers } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import sBaoSynthABI from '@/bao/lib/abi/sBaoSynth.json'
import { Erc20__factory } from '@/typechain/factories'

const supportedSynths = ['baoETH', 'baoUSD']

export const Interface = () => {
	const [selectedOption, setSelectedOption] = useState('baoUSD')
	const [inputVal, setInputVal] = useState('')
	const [allowance, setAllowance] = useState<BigNumber>(BigNumber.from(0))
	const [apr, setApr] = useState<string>('0')
	const { account, library } = useWeb3React()
	const { onAddTransaction } = useTransactionProvider()
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)
	const baoETHBalance = useTokenBalance(Config.addressMap.baoETH)

	const selectedTokenAddress = useMemo(() => {
		return Config.addressMap[selectedOption as keyof typeof Config.addressMap]
	}, [selectedOption])

	const stakingContractAddress = useMemo(() => {
		return Config.addressMap.sBaoSynth
	}, [])

	// Get contract instances
	const getContracts = useCallback(() => {
		if (!library || !account) return null

		const signer = library.getSigner()
		const tokenContract = Erc20__factory.connect(selectedTokenAddress, signer)
		const stakingContract = new Contract(stakingContractAddress, sBaoSynthABI, signer)

		return { tokenContract, stakingContract }
	}, [library, account, selectedTokenAddress, stakingContractAddress])

	// Fetch allowance and APR
	useEffect(() => {
		const fetchData = async () => {
			const contracts = getContracts()
			if (!contracts || !account) return

			const { tokenContract, stakingContract } = contracts

			// Get allowance
			const allowance = await tokenContract.allowance(account, stakingContractAddress)
			setAllowance(allowance)

			// Calculate APR from weekly revenue
			const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
			const weeklyRevenue = await stakingContract.weeklyRevenue(currentWeek)
			const totalAssets = await stakingContract.totalAssets()

			if (totalAssets.gt(0)) {
				const yearlyRevenue = weeklyRevenue.mul(52)
				const aprBN = yearlyRevenue.mul(10000).div(totalAssets)
				setApr(aprBN.toNumber() / 100 + '')
			}
		}

		fetchData()
	}, [account, getContracts, stakingContractAddress]) // Added stakingContractAddress to dependencies

	// Handle approval
	const handleApprove = async () => {
		const contracts = getContracts()
		if (!contracts || !account) return

		const { tokenContract } = contracts
		try {
			const tx = await tokenContract.approve(stakingContractAddress, ethers.constants.MaxUint256)
			onAddTransaction({
				hash: tx.hash,
				description: 'Approve ' + selectedOption,
			})
			await tx.wait()
			setAllowance(ethers.constants.MaxUint256)
		} catch (error) {
			console.error('Approval failed:', error)
		}
	}

	// Handle deposit
	const handleDeposit = async () => {
		const contracts = getContracts()
		if (!contracts || !account || !inputVal) return

		const { stakingContract } = contracts
		try {
			const amount = parseEther(inputVal)
			const tx = await stakingContract.deposit(amount, account)
			onAddTransaction({
				hash: tx.hash,
				description: 'Stake ' + selectedOption,
			})
			await tx.wait()
			setInputVal('')
		} catch (error) {
			console.error('Deposit failed:', error)
		}
	}

	const handleAction = async () => {
		if (!account) return
		const amount = parseEther(inputVal)
		if (allowance.lt(amount)) {
			await handleApprove()
		} else {
			await handleDeposit()
		}
	}

	const currentBalance = selectedOption === 'baoUSD' ? baoUSDBalance : baoETHBalance

	const bInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography className='font-bold text-baoRed'>Balance:</Typography>
					<Typography variant='sm' className='font-bold'>
						{getDisplayBalance(currentBalance)}
					</Typography>
					<Image
						className='z-10 inline-block select-none'
						src={`/images/tokens/${selectedOption}-pink.svg`}
						alt={selectedOption}
						width={16}
						height={16}
					/>
				</div>
			</div>
			<div className='m-auto flex w-full glassmorphic-card'>
				<Listbox value={selectedOption} onChange={setSelectedOption}>
					{({ open }) => (
						<div className='flex-col'>
							<Listbox.Button className={(classNames(open ? 'text-baoRed' : 'text-baoWhite'), 'inline-flex')}>
								<div className='m-2 flex w-[130px] glassmorphic-card bg-baoWhite bg-opacity-5 px-1 duration-300 hover:bg-transparent-300'>
									<div className='m-auto w-auto py-1 text-baoWhite lg:py-2'>
										{selectedOption === '' ? (
											<Typography>Select a synth</Typography>
										) : (
											<div className='h-full items-start'>
												<div className='mr-2 inline-block'>
													<Image
														className='z-10 inline-block select-none'
														src={`/images/tokens/${selectedOption}-pink.svg`}
														alt={`baoUSD`}
														width={20}
														height={20}
													/>
												</div>
												<span className='inline-block text-left align-middle'>
													<Typography variant='base' className='font-bakbak'>
														{selectedOption}
													</Typography>
												</span>
											</div>
										)}
									</div>
									<div className='m-auto ml-0 w-auto justify-end text-end'>
										<ChevronDownIcon className='h-5 w-5 text-baoRed' aria-hidden='true' />
									</div>
								</div>
							</Listbox.Button>

							<Transition
								show={open}
								as={Fragment}
								leave='transition ease-in duration-100 z-20'
								leaveFrom='opacity-100'
								leaveTo='opacity-0'
							>
								<Listbox.Options className='absolute !z-30 p-2 -mt-1 ml-3 w-[200px] origin-left overflow-hidden !bg-baoBlack glassmorphic-card ring-1 ring-black ring-opacity-5 focus:outline-none lg:inset-x-auto'>
									<div className='text-left font-bakbak text-baoWhite pt-2 pl-4 mb-2'>
										<Typography variant='lg'>Asset</Typography>
									</div>
									{supportedSynths.map((synth, index) => (
										<Listbox.Option
											key={index}
											className={({ active }) =>
												classNames(
													active ? 'border !border-baoRed bg-baoWhite bg-opacity-5 text-baoRed' : 'text-baoWhite',
													'cursor-pointer select-none glassmorphic-card shadow-none p-4 text-sm',
												)
											}
											value={synth}
										>
											<div className='flex place-items-center'>
												<Image
													className='z-10 inline-block select-none'
													src={`/images/tokens/${synth}-pink.svg`}
													alt={synth}
													width={24}
													height={24}
												/>
												<span className='ml-2 inline-block text-left align-middle'>
													<Typography variant='lg' className='font-bakbak'>
														{synth}
													</Typography>
												</span>
											</div>
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					)}
				</Listbox>
				<Input
					onSelectMax={() => setInputVal(formatEther(selectedOption === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString())}
					onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
					value={inputVal}
					placeholder={`${formatEther(selectedOption === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString()}`}
					className='!pl-0 !rounded-3xl !border-0'
				/>
			</div>
		</>
	)

	const StakingPosition: React.FC<{ selectedOption: string }> = ({ selectedOption }) => {
		const [stakedBalance, setStakedBalance] = useState<BigNumber>(BigNumber.from(0))
		const [withdrawAmount, setWithdrawAmount] = useState('')
		const { account, library } = useWeb3React()
		const { onAddTransaction } = useTransactionProvider()
		const stakingContractAddress = Config.addressMap.sBaoSynth

		const getStakingContract = useCallback(() => {
			if (!library || !account) return null
			return new Contract(stakingContractAddress, sBaoSynthABI, library.getSigner())
		}, [library, account, stakingContractAddress])

		// Fetch staked balance
		useEffect(() => {
			const fetchStakedBalance = async () => {
				const contract = getStakingContract()
				if (!contract || !account) return
				try {
					const balance = await contract.balanceOf(account)
					setStakedBalance(balance)
				} catch (error) {
					console.error('Failed to fetch staked balance:', error)
					setStakedBalance(BigNumber.from(0))
				}
			}

			if (account) {
				fetchStakedBalance()
			}

			// Set up an interval to refresh the balance periodically
			const interval = setInterval(fetchStakedBalance, 15000) // refresh every 15 seconds

			return () => clearInterval(interval)
		}, [account, getStakingContract])

		const handleWithdraw = async () => {
			const contract = getStakingContract()
			if (!contract || !account || !withdrawAmount) return

			try {
				const amount = parseEther(withdrawAmount)
				const tx = await contract.withdraw(amount, account, account)
				onAddTransaction({
					hash: tx.hash,
					description: `Unstake ${selectedOption}`,
				})
				await tx.wait()
				setWithdrawAmount('')
			} catch (error) {
				console.error('Withdrawal failed:', error)
			}
		}

		if (!account || stakedBalance.eq(0)) return null

		return (
			<Card className='glassmorphic-card p-5 w-full mx-auto mt-4'>
				<Card.Body>
					<Typography variant='lg' className='font-bold mb-4'>
						Your Staked Position
					</Typography>
					<div className='flex w-full justify-between mb-4'>
						<Typography variant='sm' className='text-left'>
							Staked Balance
						</Typography>
						<div className='flex items-center gap-2'>
							<Typography variant='sm' className='text-right'>
								{formatEther(stakedBalance)} s{selectedOption}
							</Typography>
							<Image
								className='inline-block select-none'
								src={`/images/tokens/${selectedOption}-pink.svg`}
								alt={selectedOption}
								width={16}
								height={16}
							/>
						</div>
					</div>
					<div className='flex gap-4'>
						<Input
							value={withdrawAmount}
							onChange={(e: { currentTarget: { value: string } }) => setWithdrawAmount(e.currentTarget.value)}
							onSelectMax={() => setWithdrawAmount(formatEther(stakedBalance))}
							placeholder='Amount to unstake'
							className='!rounded-3xl'
						/>
						<Button
							onClick={handleWithdraw}
							disabled={!withdrawAmount || parseEther(withdrawAmount || '0').eq(0) || parseEther(withdrawAmount).gt(stakedBalance)}
							text='Unstake'
							className={classNames(
								'min-w-[120px]',
								!withdrawAmount || parseEther(withdrawAmount || '0').eq(0) || parseEther(withdrawAmount).gt(stakedBalance)
									? 'cursor-not-allowed opacity-50'
									: 'cursor-pointer hover:bg-baoRed/50 active:bg-baoRed/50',
							)}
						/>
					</div>
				</Card.Body>
			</Card>
		)
	}

	return (
		<>
			<Card className='glassmorphic-card p-5 w-full mx-auto mt-8'>
				<Card.Body>
					{bInput}
					<div className='h-10' />
					<div className='space-y-3'>
						<div className='flex w-full justify-between'>
							<Typography variant='sm' className='text-left'>
								Projected APR
							</Typography>
							<Typography variant='sm' className='text-right'>
								{apr}%
							</Typography>
						</div>
						<div className='flex w-full justify-between'>
							<Typography variant='sm' className='text-left'>
								You will receive
							</Typography>
							<Typography variant='sm' className='text-right'>
								{inputVal ? `${inputVal} s${selectedOption}` : `0 s${selectedOption}`}
							</Typography>
						</div>
					</div>
					<Button
						onClick={handleAction}
						disabled={!account || !inputVal || parseEther(inputVal || '0').eq(0)}
						text={!account ? 'Connect Wallet' : allowance.lt(parseEther(inputVal || '0')) ? 'Approve' : 'Stake'}
						className={classNames(
							'w-full mt-5',
							'relative',
							!account || !inputVal || parseEther(inputVal || '0').eq(0)
								? 'cursor-not-allowed opacity-50'
								: 'cursor-pointer hover:bg-baoRed/50 active:bg-baoRed/50',
						)}
					/>
				</Card.Body>
			</Card>
			<StakingPosition selectedOption={selectedOption} />
		</>
	)
}

export default Interface
