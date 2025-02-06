import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useEffect, useState, useMemo } from 'react'
import Config from '@/bao/lib/config'
import { getDisplayBalance } from '@/utils/numberFormat'
import Modal from '@/components/Modal'
import { VaultAsset } from '@/bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'
import { formatCompact, formatTokenAmount, formatUSD } from '@/utils/formatNumbers'

interface BorrowListProps {
	marketName: string
	totalBorrow?: number
}

interface BorrowListItemProps {
	asset: VaultAsset
	marketName: string
}

export const BorrowList: React.FC<BorrowListProps> = ({ marketName, totalBorrow }) => {
	const market = Config.vaults[marketName]
	if (!market) return null

	return (
		<div className='rounded-lg border border-gray-800'>
			<div className='flex justify-between items-center p-4 bg-gray-900'>
				<div className='text-lg font-semibold'>Borrowed</div>
				<div className='text-gray-400'>{totalBorrow}</div>
			</div>
			<ListHeader headers={['Asset', 'Balance', '']} />
			<div className='flex flex-col gap-1'>
				<div className='flex flex-col gap-4'>
					{market.assets
						.filter(asset => asset.borrow === true && asset.active)
						.map(asset => (
							<BorrowListItem asset={asset} key={asset.id} marketName={marketName} />
						))}
				</div>
			</div>
		</div>
	)
}

export const BorrowListItem: React.FC<BorrowListItemProps> = ({ asset, marketName }) => {
	const { chainId } = useWeb3React()
	const accountBalances = useAccountBalances(marketName)
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [formattedBalance, setFormattedBalance] = useState<string>('0.00')

	const balance = useMemo(() => {
		if (!accountBalances || !asset || !asset.underlyingAddress[chainId]) return null
		return accountBalances.find(({ address }) => address === asset.underlyingAddress[chainId])
	}, [accountBalances, asset, chainId])

	useEffect(() => {
		if (balance) {
			setFormattedBalance(formatTokenAmount(balance.balance, 4))
		}
	}, [balance])

	return (
		<>
			<div
				className='w-full px-4 py-2 duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20 cursor-pointer'
				onClick={() => setShowBorrowModal(!showBorrowModal)}
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

					<div className='mx-auto my-0 flex w-full items-center justify-center'>{balance ? formattedBalance : <Loader />}</div>

					<div className='mx-auto my-0 flex w-full flex-auto items-end justify-end text-right'>Borrow</div>
				</div>
			</div>

			<Modal isOpen={showBorrowModal} onDismiss={() => setShowBorrowModal(false)}>
				Borrow
			</Modal>
		</>
	)
}

export default BorrowList
