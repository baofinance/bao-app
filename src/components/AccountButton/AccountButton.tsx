import { faAngleDoubleRight, faLink, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import useTokenBalance, { useEthBalance } from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import AccountModal from '../AccountModal'
import Button from '../Button'
import Loader from '../Loader'
import WalletProviderModal from '../WalletProviderModal'
import { default as UDResolution } from '@unstoppabledomains/resolution'
import Config from '@/bao/lib/config'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const udResolution = new UDResolution()
async function udReverseAddress(address: string): Promise<string> {
	const domain = await udResolution.reverse(address)
	return domain
}

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = () => {
	const { account, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [showAccountModal, setShowAccountModal] = useState(false)
	const [showWalletProviderModal, setShowWalletProviderModal] = useState(false)
	const [ens, setEns] = useState<string | undefined>()
	const [ud, setUd] = useState<string | undefined>()

	const [selectedAsset, setSelectedAsset] = useState('ETH')
	const ethBalance = useEthBalance()
	const baoBalance = useTokenBalance(Config.contracts.Baov2[chainId].address)
	const assets = [
		['0', 'ETH', ethBalance.toString()],
		['1', 'BAO', baoBalance.toString()],
	]
	const asset = assets.length ? assets.find(asset => asset[1] === selectedAsset) : assets.find(asset => asset[1] === 'ETH')

	useEffect(() => {
		const ensResolver = new ethers.providers.JsonRpcProvider(`${process.env.NEXT_PUBLIC_ALCHEMY_API_URL}`)
		if (!account) return
		ensResolver.lookupAddress(account).then(_ens => {
			if (_ens) setEns(_ens)
		})
	}, [account])

	useEffect(() => {
		if (!account) return
		console.log(account)
		udReverseAddress(account)
			.then(_ud => {
				if (_ud) setUd(_ud)
			})
			.catch(() => {
				console.error('error: cannot get UD')
			})
	}, [account])

	const pendingTxs = useMemo(() => Object.keys(transactions).filter(txHash => !transactions[txHash].receipt).length, [transactions])

	const vanityId = ens || ud
	const vanityAddress = account ? `${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}` : '0x0000...abcd'
	const displayId = vanityId || vanityAddress

	return (
		<>
			{!account ? (
				<ConnectButton />
			) : (
				<>
					<ConnectButton />
					{/* <div className='hidden lg:block'>
						<Listbox value={selectedAsset} onChange={setSelectedAsset}>
							{({ open }) => (
								<>
									<div>
										<Listbox.Button className={(classNames(open ? 'text-baoRed' : 'text-baoWhite'), 'inline-flex')}>
											<div className='m-1 flex w-fit glassmorphic-card px-4 py-[6px] duration-300 hover:border-baoRed hover:bg-transparent-300'>
												<div className='w-full text-baoWhite'>
													<div className='h-full items-start'>
														<span className='inline-block text-left align-middle'>
															<Typography variant='xl' className='font-bakbak'>
																{getDisplayBalance(asset[2])}
															</Typography>
														</span>
														<div className='ml-2 inline-block'>
															<Image
																className='z-10 inline-block select-none'
																src={`/images/tokens/${asset[1]}.png`}
																alt={asset[1]}
																width={24}
																height={24}
															/>
														</div>
													</div>
												</div>
											</div>
										</Listbox.Button>
										<Transition
											show={open}
											as={Fragment}
											leave='transition ease-in duration-100'
											leaveFrom='opacity-100'
											leaveTo='opacity-0'
										>
											<Listbox.Options className='absolute z-10 origin-bottom-left overflow-hidden glassmorphic-card p-2 shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none'>
												{assets.map(([index, symbol, balance]) => (
													<Listbox.Option
														key={index}
														className={({ active }) =>
															classNames(
																active ? 'border !border-baoRed bg-baoWhite bg-opacity-5 text-baoRed' : 'text-baoWhite',
																'cursor-pointer select-none glassmorphic-card border-baoBlack border-opacity-0 p-2',
															)
														}
														value={symbol}
													>
														{() => (
															<div className='mx-0 my-auto items-end gap-4 text-right'>
																<span className='inline-block text-right align-middle'>
																	<Typography variant='xl' className='font-bakbak'>
																		{getDisplayBalance(balance)}
																	</Typography>
																</span>
																<div className='ml-2 inline-block'>
																	<Image
																		className='z-10 inline-block select-none'
																		src={`/images/tokens/${symbol}.png`}
																		alt={symbol}
																		width={24}
																		height={24}
																	/>
																</div>
															</div>
														)}
													</Listbox.Option>
												))}
											</Listbox.Options>
										</Transition>
									</div>
								</>
							)}
						</Listbox>
					</div> */}
				</>
			)}
			<AccountModal show={showAccountModal} onHide={() => setShowAccountModal(false)} />
			<WalletProviderModal show={showWalletProviderModal} onHide={() => setShowWalletProviderModal(false)} />
		</>
	)
}

export default AccountButton
