import { FC, useState } from 'react'
import { Asset } from '@/hooks/lend/useMarketTotals'
import { ethers } from 'ethers'
import Image from 'next/image'

interface AssetStatsBoxProps {
	asset: Asset
	marketName: string
	expanded?: boolean
}

const AssetStatsBox: FC<AssetStatsBoxProps> = ({ asset, marketName, expanded = false }) => {
	const [isExpanded, setIsExpanded] = useState(expanded)

	// Format balance for display
	const formattedBalance = asset.balance ? ethers.utils.formatUnits(asset.balance, asset.decimals || 18) : '0'
	const formattedUSD = asset.balanceUSD || '0'

	return (
		<div>
			<div
				className='glassmorphic-card p-4 cursor-pointer hover:border-baoRed transition-colors duration-200'
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className='flex justify-between items-center'>
					<div className='flex items-center space-x-3'>
						{asset.icon && (
							<div className='w-8 h-8'>
								<Image src={asset.icon} alt={asset.name} width={32} height={32} />
							</div>
						)}
						<div>
							<h3 className='text-lg font-medium'>{asset.name}</h3>
							<p className='text-sm text-gray-500'>
								{asset.supply ? 'Supply Asset' : ''}
								{asset.borrow ? 'Borrow Asset' : ''}
							</p>
						</div>
					</div>
					<div className='text-right'>
						<p className='text-lg'>{formattedBalance}</p>
						<p className='text-sm text-gray-500'>${formattedUSD}</p>
					</div>
				</div>
			</div>

			{isExpanded && (
				<div className='mt-2 p-4 glassmorphic-card'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<p className='text-sm text-gray-500'>Balance</p>
							<p className='text-lg'>{formattedBalance}</p>
							<p className='text-sm text-gray-500'>${formattedUSD}</p>
						</div>
						{/* Add more expanded details here */}
					</div>
				</div>
			)}
		</div>
	)
}

interface AssetsCardProps {
	assets: Asset[]
	marketName: string
}

export const AssetsCard: FC<AssetsCardProps> = ({ assets, marketName }) => {
	return (
		<div className='space-y-4'>
			{assets.map((asset, i) => (
				<AssetStatsBox key={`${asset.name}-${i}`} asset={asset} marketName={marketName} />
			))}
		</div>
	)
}
