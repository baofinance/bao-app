import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useEffect, useState } from 'react'
import Config from '@/bao/lib/config'
import { getDisplayBalance } from '@/utils/numberFormat'
import Modal from '@/components/Modal'
import { useSupplyBalances } from '@/hooks/vaults/useBalances'
import { Asset } from '@/bao/lib/types'

export const BorrowList: React.FC = () => {
	const assets = Config.assets

	return (
		<>
			<div className='glassmorphic-card py-4'>
				<Typography variant='lg' className='text-base text-medium leading-5 mb-4 text-center font-bakbak text-xl'>
					Borrowed
				</Typography>
				<ListHeader headers={['Asset', 'Balance', '']} />
				<div className='flex flex-col gap-1'>
					<div className='flex flex-col gap-4'>
						{assets && assets.filter(asset => asset.borrow === true).map(asset => <BorrowListItem asset={asset} key={asset.id} />)}
					</div>
				</div>
			</div>
		</>
	)
}

const BorrowListItem: React.FC<BorrowListItemProps> = ({ asset }) => {
	const balance = { assetBalance: 10, assetDecimals: 10 }
	const [formattedBalance, setFormattedBalance] = useState(null)
	const [showBorrowAsset, setShowBorrowAsset] = useState(false)

	useEffect(() => {
		if (balance) setFormattedBalance(getDisplayBalance(balance.assetBalance, balance.assetDecimals))
	}, [balance])

	const handleClick = () => {
		setShowBorrowAsset(!showBorrowAsset)
	}

	return (
		<>
			<button
				className='w-full px-4 py-2 duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
				onClick={() => handleClick()}
			>
				<div className='flex w-full flex-row'>
					<div className='flex w-full'>
						<div className='my-auto flex place-items-center'>
							<Image src={asset.icon} alt={asset.name} className={`inline-block`} height={32} width={32} />
							<span className='inline-block text-left align-middle'>
								<Typography variant='lg' className='ml-2 font-bakbak'>
									{asset.name}
								</Typography>
							</span>
						</div>
					</div>

					<div className='mx-auto my-0 flex w-full items-center justify-center'>{formattedBalance ? formattedBalance : <Loader />}</div>

					<div className='mx-auto my-0 flex w-full flex-auto items-end justify-end text-right'>Borrow</div>
				</div>
			</button>

			<Modal isOpen={showBorrowAsset} onDismiss={() => handleClick()}>
				Borrow
			</Modal>
		</>
	)
}

export default BorrowList

type BorrowListItemProps = {
	asset: Asset
}
