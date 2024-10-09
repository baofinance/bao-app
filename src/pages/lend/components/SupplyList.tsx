import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useEffect, useMemo, useState } from 'react'
import Config from '@/bao/lib/config'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Asset, Balance, TotalSupply } from '@/bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import Button from '@/components/Button'
import SupplyModal from '@/pages/lend/components/Modals/SupplyModal'
import BorrowModal from '@/pages/lend/components/Modals/BorrowModal'
import WithdrawModal from '@/pages/lend/components/Modals/WithdrawModal'
import RepayModal from '@/pages/lend/components/Modals/RepayModal'
import { BigNumber } from 'ethers'
import Tooltipped from '@/components/Tooltipped'
import { StatBlock } from '@/components/Stats'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { Transition } from '@headlessui/react'
import Card from '@/components/Card'

export const SupplyList: React.FC<SupplyListProps> = ({ accountBalances, marketName, borrowBalances, totalSupplies }) => {
	const assets = Config.lendMarkets[marketName].assets

	return (
		<>
			<Typography variant='xl' className='p-4 text-left font-bakbak'>
				Assets
			</Typography>
			<div className='flex w-full gap-2'>
				<div className='z-20 flex flex-col place-items-center gap-2 w-full'>
					{assets &&
						assets.map(asset => (
							<SupplyListItem
								asset={asset}
								key={asset.id}
								accountBalances={accountBalances}
								borrowBalances={borrowBalances}
								totalSupplies={totalSupplies}
								marketName={marketName}
							/>
						))}
				</div>
			</div>
		</>
	)
}

const SupplyListItem: React.FC<SupplyListItemProps> = ({ asset, accountBalances, marketName, borrowBalances, totalSupplies }) => {
	const { chainId } = useWeb3React()
	const [balance, setBalance] = useState(null)
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const [showWithdrawModal, setShowWithdrawModal] = useState(false)
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [showRepayModal, setShowRepayModal] = useState(false)
	const [showInfo, setShowInfo] = useState(false)
	const [selectedOption, setSelectedOption] = useState('ETH')

	const yourPosition = useMemo(
		() =>
			borrowBalances &&
			getDisplayBalance(borrowBalances.find(balance => balance.address === asset.marketAddress[chainId]).balance, asset.underlyingDecimals),
		[borrowBalances, asset],
	)

	const totalMarketSupply = useMemo(
		() =>
			totalSupplies &&
			getDisplayBalance(
				totalSupplies.find(totalSupply => totalSupply.address === asset.underlyingAddress[chainId]).totalSupply,
				asset.underlyingDecimals,
			),
		[totalSupplies, asset],
	)

	/*
	function fetchBalance(asset: Asset) {
		if (accountBalances !== null && accountBalances !== undefined)
			return accountBalances.find(({ address }) => address === asset.underlyingAddress[chainId])
	}

	useEffect(() => {
		const balance = fetchBalance(asset)
		if (balance !== null && balance !== undefined) {
			setBalance(balance)
			setFormattedBalance(getDisplayBalance(balance.balance, balance.decimals))
		}
	}, [accountBalances])
	*/
	return (
		<>
			<div className={'flex w-full justify-between place-items-center gap-5 glassmorphic-card p-2'} key={asset.toString()}>
				<Tooltipped
					content={false !== !asset.active ? 'Inactive' : 'Active'}
					key={asset.name}
					placement='top'
					className='rounded-full bg-baoRed '
				>
					<div
						key={asset.toString()}
						className={
							'text-baoWhite flex overflow-hidden rounded-2xl border border-baoWhite/20 bg-baoBlack shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none select-none border-baoBlack px-2 py-3 text-sm'
						}
					>
						<div className='mx-0 my-auto flex h-full justify-center items-center gap-4 w-[200px]'>
							<div className='col-span-3'>
								<Image className='z-10 inline-block select-none' src={`${asset.icon}`} alt={asset.name} width={28} height={28} />
								<span className='ml-2 inline-block text-left align-middle'>
									<Typography variant='lg' className='font-bakbak'>
										{asset.name}
									</Typography>
								</span>
							</div>
						</div>
					</div>
				</Tooltipped>
				<table className='table-fixed justify-between w-2/3  text-left md:table hidden'>
					<thead>
						<tr className='text-baoWhite/60'>
							<th>Total market supply</th>
							<th>Your Position</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className='font-bakbak text-xl'>{totalMarketSupply ? totalMarketSupply : <Loader />}</td>
							<td className='font-bakbak text-xl'>{yourPosition ? yourPosition : <Loader />}</td>
						</tr>
					</tbody>
				</table>
				<div className='m-auto mr-2 flex space-x-2'>
					{/* <Button
						className='!p-3'
						onClick={() => {
							setSelectedOption(asset.name)
							setShowInfo(true)
						}}
					>
						<FontAwesomeIcon icon={faCircleInfo} width={24} height={24} />
					</Button> */}
					{asset.supply === true && (
						<>
							<Button onClick={() => setShowSupplyModal(true)}>Supply</Button>
							<Button onClick={() => setShowWithdrawModal(true)}>Withdraw</Button>
						</>
					)}
					{asset.borrow === true && (
						<>
							<Button onClick={() => setShowBorrowModal(true)}>Borrow</Button>
							<Button onClick={() => setShowRepayModal(true)}>Repay</Button>
						</>
					)}
				</div>

				<SupplyModal
					asset={asset}
					show={showSupplyModal}
					onHide={() => setShowSupplyModal(!showSupplyModal)}
					marketName={marketName}
					fullBalance={balance}
				/>
				<WithdrawModal
					asset={asset}
					show={showWithdrawModal}
					onHide={() => setShowWithdrawModal(!showWithdrawModal)}
					marketName={marketName}
				/>
				<BorrowModal asset={asset} show={showBorrowModal} onHide={() => setShowBorrowModal(!showBorrowModal)} />
				<RepayModal asset={asset} show={showRepayModal} onHide={() => setShowRepayModal(!showRepayModal)} marketName={marketName} />
			</div>
		</>
	)
}

export default SupplyList

type SupplyListItemProps = {
	asset: Asset
	accountBalances: Balance[]
	marketName: string
	borrowBalances: Balance[]
	totalSupplies: TotalSupply[]
}

type SupplyListProps = {
	accountBalances: Balance[]
	marketName: string
	borrowBalances: Balance[]
	totalSupplies: TotalSupply[]
}
