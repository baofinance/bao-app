import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import { useAccountBalances } from '@/hooks/vaults/useBalances'
import useBallastInfo from '@/hooks/vaults/useBallastInfo'
import { useVaults } from '@/hooks/vaults/useVaults'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { Fragment, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'

const supportedSynths = ['baoETH', 'baoUSD']

export const Interface = () => {
	const [selectedOption, setSelectedOption] = useState('baoUSD')
	const [inputVal, setInputVal] = useState('')
	const { account } = useWeb3React()
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)
	const baoETHBalance = useTokenBalance(Config.addressMap.baoETH)
	const ballastInfo = useBallastInfo(selectedOption)
	const accountBalances = useAccountBalances(selectedOption)
	const _vaults = useVaults(selectedOption)

	const synth = useMemo(() => {
		return _vaults?.find(vault => vault.isSynth)
	}, [_vaults])

	const bInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography className='font-bold text-baoRed'>Balance:</Typography>
					<Typography variant='sm' className='font-bold'>
						{selectedOption === 'baoUSD' ? `${getDisplayBalance(baoUSDBalance)}` : `${getDisplayBalance(baoETHBalance)}`}
					</Typography>
					{selectedOption === 'baoUSD' ? (
						<Image className='z-10 inline-block select-none' src='/images/tokens/baoUSD.png' alt='baoUSD' width={16} height={16} />
					) : (
						<Image className='z-10 inline-block select-none' src='/images/tokens/baoETH.png' alt='baoETH' width={16} height={16} />
					)}
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
														src={`/images/tokens/${selectedOption}.png`}
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
													src={`/images/tokens/${synth}.png`}
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
					// Fee calculation not ideal, fix.
					value={ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal}
					placeholder={`${formatEther(selectedOption === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString()}`}
					className='!pl-0 !rounded-3xl !border-0'
				/>
			</div>
		</>
	)

	return (
		<>
			<Card className='glassmorphic-card p-5 w-full mx-auto mt-8'>
				<Card.Body>
					{bInput}
					<div className='h-10' />
					<div className='space-y-3'>
						<div className='flex w-full justify-between'>
							<Typography variant='sm' className='text-left'>
								Annual percentage rate (APR)
							</Typography>
							<Typography variant='sm' className='text-right'>
								22%
							</Typography>
						</div>
						<div className='flex w-full justify-between'>
							<Typography variant='sm' className='text-left'>
								You will recieve
							</Typography>
							<Typography variant='sm' className='text-right'>
								1000 sbaoUSD
							</Typography>
						</div>
					</div>
					<Button text='STAKE' className='w-full mt-5 !-z-10' />
				</Card.Body>
			</Card>
		</>
	)
}

export default Interface
