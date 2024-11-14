import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import Config from '@/bao/lib/config'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Asset, Balance, TotalSupply } from '@/bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import Button from '@/components/Button'
import SupplyModal from '@/pages/lend/components/Modals/SupplyModal'
import BorrowModal from '@/pages/lend/components/Modals/BorrowModal'
import WithdrawModal from '@/pages/lend/components/Modals/WithdrawModal'
import RepayModal from '@/pages/lend/components/Modals/RepayModal'
import Tooltipped from '@/components/Tooltipped'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'

export const SupplyList: React.FC<SupplyListProps> = ({ marketName, supplyBalances, totalSupplies }) => {
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
								supplyBalances={supplyBalances}
								totalSupplies={totalSupplies}
								marketName={marketName}
							/>
						))}
				</div>
			</div>
		</>
	)
}

const SupplyListItem: React.FC<SupplyListItemProps> = ({ asset, marketName, supplyBalances, totalSupplies }) => {
	const { chainId } = useWeb3React()
	const accountBalances = useAccountBalances(marketName)
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const [showWithdrawModal, setShowWithdrawModal] = useState(false)
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [showRepayModal, setShowRepayModal] = useState(false)

	const yourPosition = useMemo(() => {
		if (!supplyBalances || !asset || !asset.marketAddress[chainId]) return null

		const balance = supplyBalances.find(balance => balance.address === asset.marketAddress[chainId])

		return balance ? getDisplayBalance(balance.balance, asset.underlyingDecimals) : null
	}, [supplyBalances, asset, chainId])

	const totalMarketSupply = useMemo(() => {
		if (!totalSupplies || !asset || !asset.underlyingAddress[chainId]) return null

		const totalSupplyItem = totalSupplies.find(totalSupply => totalSupply.address === asset.underlyingAddress[chainId])

		return totalSupplyItem ? getDisplayBalance(totalSupplyItem.totalSupply, asset.underlyingDecimals) : null
	}, [totalSupplies, asset, chainId])

	const balance = useMemo(() => {
		if (!accountBalances || !asset || !asset.underlyingAddress[chainId]) return null

		const accountBalance = accountBalances.find(({ address }) => address === asset.underlyingAddress[chainId])

		return accountBalance?.balance || null
	}, [accountBalances, asset, chainId])

	return (
		<>
			<div className={'flex w-full justify-between place-items-center gap-5 glassmorphic-card p-2'} key={asset.toString()}>
				<Tooltipped
					content={false !== !asset.active ? 'Inactive' : 'Active'}
					key={asset.name}
					placement='top'
					className='rounded-full bg-baoRed w-[20%]'
				>
					<div
						key={asset.toString()}
						className={
							'text-baoWhite flex overflow-hidden rounded-2xl border border-baoWhite/20 bg-baoBlack shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none select-none border-baoBlack px-2 py-3 text-sm'
						}
					>
						<div className='mx-0 my-auto flex h-full justify-center items-center gap-4 w-[150px]'>
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
				<table className='table-fixed justify-between w-[30%]  text-left md:table hidden'>
					<thead>
						<tr className='font-light text-baoWhite/60 text-base'>
							<th>Total market supply</th>
							<th>Your Position</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className='font-bakbak text-base'>{totalMarketSupply ? totalMarketSupply : <Loader />}</td>
							<td className='font-bakbak text-base'>{yourPosition ? yourPosition : <Loader />}</td>
						</tr>
					</tbody>
				</table>
				<div className='m-auto mr-2 flex space-x-2 w-[50%] justify-end'>
					{asset.supply === true && (
						<>
							<Button width={'w-[130px]'} onClick={() => setShowSupplyModal(true)}>
								Supply
							</Button>
							<Button width={'w-[130px]'} onClick={() => setShowWithdrawModal(true)}>
								Withdraw
							</Button>
						</>
					)}
					{asset.borrow === true && (
						<>
							<Button width={'w-[130px]'} onClick={() => setShowBorrowModal(true)}>
								Borrow
							</Button>
							<Button width={'w-[130px]'} onClick={() => setShowRepayModal(true)}>
								Repay
							</Button>
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
				<BorrowModal asset={asset} show={showBorrowModal} onHide={() => setShowBorrowModal(!showBorrowModal)} marketName={marketName} />
				<RepayModal asset={asset} show={showRepayModal} onHide={() => setShowRepayModal(!showRepayModal)} marketName={marketName} />
			</div>
		</>
	)
}

export default SupplyList

type SupplyListItemProps = {
	asset: Asset
	marketName: string
	supplyBalances: Balance[]
	totalSupplies: TotalSupply[]
}

type SupplyListProps = {
	marketName: string
	supplyBalances: Balance[]
	totalSupplies: TotalSupply[]
}
