import React from 'react'
import { formatTokenAmount, formatUSD, formatPercent } from '@/utils/formatNumbers'
import { VaultAsset } from '@/bao/lib/types'
import { useSupplyRate } from '@/hooks/lend/useSupplyRate'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { useWeb3React } from '@web3-react/core'

interface MarketStatsProps {
	asset: VaultAsset
	totalSupplied: number
	totalSuppliedUSD: number
	totalBorrowed: number
	totalBorrowedUSD: number
	maxLTV?: number
}

const MarketStats: React.FC<MarketStatsProps> = ({
	asset,
	totalSupplied,
	totalSuppliedUSD,
	totalBorrowed,
	totalBorrowedUSD,
	maxLTV = 90,
}) => {
	const { chainId } = useWeb3React()
	const supplyRateData = useSupplyRate(asset.name, asset.ctokenAddress, asset.llamaId)
	const borrowRates = useBorrowApy(asset.name)

	// Get the borrow rate for this specific asset
	const borrowRate = chainId && asset.underlyingAddress[chainId] ? borrowRates[asset.underlyingAddress[chainId]] : 0

	return (
		<div className='grid grid-cols-6 gap-4 px-4 py-2 hover:bg-gray-900/50'>
			<div className='flex items-center gap-2'>
				<img src={asset.icon} alt={asset.name} className='w-8 h-8' />
				<div>
					<div className='font-semibold'>{asset.name}</div>
					{asset.supply && !asset.borrow && <div className='text-sm text-gray-400'>Collateral Only</div>}
				</div>
			</div>

			<div>
				<div>{formatTokenAmount(totalSupplied, 6)}</div>
				<div className='text-sm text-gray-400'>{formatUSD(totalSuppliedUSD)}</div>
			</div>

			<div className='text-center'>{supplyRateData ? formatPercent(supplyRateData.totalApy) : '-'}</div>

			<div className='text-center'>{maxLTV ? formatPercent(maxLTV) : '-'}</div>

			<div>
				{totalBorrowed ? (
					<>
						<div>{formatTokenAmount(totalBorrowed, 6)}</div>
						<div className='text-sm text-gray-400'>{formatUSD(totalBorrowedUSD)}</div>
					</>
				) : (
					'-'
				)}
			</div>

			<div className='text-center'>{borrowRate ? formatPercent(borrowRate) : '-'}</div>
		</div>
	)
}

export default MarketStats
