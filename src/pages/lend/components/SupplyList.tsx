import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useEffect, useState } from 'react'
import Config from '@/bao/lib/config'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Asset, Balance } from '@/bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import Button from '@/components/Button'
import SupplyModal from '@/pages/lend/components/Modals/SupplyModal'
import BorrowModal from '@/pages/lend/components/Modals/BorrowModal'

export const SupplyList: React.FC<SupplyListProps> = ({ accountBalances, marketName }) => {
	const assets = Config.lendMarkets[marketName].assets

	return (
		<>
			<div className='flex flex-col gap-1'>
				<div className='flex flex-col gap-4'>
					{assets &&
						assets.map(asset => <SupplyListItem asset={asset} key={asset.id} accountBalances={accountBalances} marketName={marketName} />)}
				</div>
			</div>
		</>
	)
}

const SupplyListItem: React.FC<SupplyListItemProps> = ({ asset, accountBalances, marketName }) => {
	const { chainId } = useWeb3React()
	const [formattedBalance, setFormattedBalance] = useState(null)
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const [showBorrowModal, setShowBorrowModal] = useState(false)

	function fetchBalance(asset: Asset) {
		if (accountBalances !== null && accountBalances !== undefined)
			return accountBalances.find(({ address }) => address === asset.underlyingAddress[chainId])
	}

	useEffect(() => {
		const balance = fetchBalance(asset)
		if (balance !== null && balance !== undefined) setFormattedBalance(getDisplayBalance(balance.balance, balance.decimals))
	}, [accountBalances])

	return (
		<>
			<div className='flex w-full justify-between place-items-center gap-5 glassmorphic-card p-2'>
				<div
					key={asset.name}
					className='text-baoWhite flex overflow-hidden rounded-2xl bg-baoBlack shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none select-none border-baoBlack px-2 py-3 text-sm'
				>
					<div className='mx-0 my-auto flex h-full justify-center items-center gap-4 w-[180px]'>
						<div className='col-span-3'>
							<Image className='z-10 inline-block select-none' src={asset.icon} alt={asset.name} width={24} height={24} />
							<span className='ml-2 inline-block text-left align-middle'>
								<Typography variant='lg' className='font-bakbak'>
									{asset.name}
								</Typography>
							</span>
						</div>
					</div>
				</div>
				<table className='table-fixed justify-between w-2/3 text-left md:table hidden'>
					<thead>
						<tr className=''>
							<th>Account balance</th>
						</tr>
					</thead>
					<div className='h-1 w-[200px] bg-red-400' />
					<tbody>
						<tr>
							<td>{formattedBalance ? formattedBalance : <Loader />}</td>
						</tr>
					</tbody>
				</table>
				<div className='m-auto mr-2 flex space-x-2'>
					{asset.supply === true && <Button onClick={() => setShowSupplyModal(true)}>Supply</Button>}
					{asset.borrow === true && <Button onClick={() => setShowBorrowModal(true)}>Borrow</Button>}
				</div>

				<SupplyModal asset={asset} show={showSupplyModal} onHide={() => setShowSupplyModal(!showSupplyModal)} marketName={marketName} />
				<BorrowModal asset={asset} show={showBorrowModal} onHide={() => setShowBorrowModal(!showBorrowModal)} />
			</div>
		</>
	)
}

export default SupplyList

type SupplyListItemProps = {
	asset: Asset
	accountBalances: Balance[]
	marketName: string
}

type SupplyListProps = {
	accountBalances: Balance[]
	marketName: string
}
