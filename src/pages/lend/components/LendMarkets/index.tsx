import { FC, useState } from 'react'
import { formatUSD, formatTokenAmount, formatPercent } from '@/utils/formatNumbers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import MarketList from '../MarketList'
import { useMarketTotals } from '@/hooks/lend/useMarketTotals'
import { VaultAsset } from '@/bao/lib/types'

interface MarketProps {
	market: {
		name: string
		desc: string
		active: boolean
		assets: VaultAsset[]
	}
}

const Market: FC<MarketProps> = ({ market }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const marketTotals = useMarketTotals(market.assets)

	// Convert marketTotals array to object format expected by MarketList
	const totalsMap = marketTotals.reduce(
		(acc, total) => ({
			...acc,
			[total.name]: {
				totalSupplied: total.supply,
				totalSuppliedUSD: total.supply * (total.price || 0),
				totalBorrowed: total.borrow,
				totalBorrowedUSD: total.borrow * (total.price || 0),
				maxLTV: 0, // TODO: Get from useCollateralFactor
			},
		}),
		{},
	)

	return (
		<div className='rounded-lg border border-gray-800'>
			{/* Market Header - Always visible */}
			<div className='flex justify-between items-center p-4 cursor-pointer' onClick={() => setIsExpanded(!isExpanded)}>
				<div>
					<h2 className='text-xl font-semibold'>{market.name}</h2>
					<p className='text-gray-400'>{market.desc}</p>
				</div>
				<FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className='text-gray-400' />
			</div>

			{/* Expanded View */}
			{isExpanded && <MarketList marketName={market.name} assets={market.assets} marketTotals={totalsMap} />}
		</div>
	)
}

interface LendMarketsProps {
	markets: Array<{
		name: string
		desc: string
		active: boolean
		assets: VaultAsset[]
	}>
}

const LendMarkets: FC<LendMarketsProps> = ({ markets }) => {
	return (
		<div className='space-y-6'>
			{markets
				.filter(market => market.active)
				.map(market => (
					<Market key={market.name} market={market} />
				))}
		</div>
	)
}

export default LendMarkets
