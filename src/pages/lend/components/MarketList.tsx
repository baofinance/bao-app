import React, { FC } from 'react'
import { SupplyList } from './SupplyList'
import { BorrowList } from './BorrowList'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'
import Config from '@/bao/lib/config'

interface MarketListProps {
	marketName?: string
}

const MarketList: FC<MarketListProps> = ({ marketName = 'weETH' }) => {
	const supplyBalances = useAccountBalances(marketName)

	// Validate market exists
	if (!Config.lendMarkets?.[marketName]) {
		console.warn(`Market ${marketName} not found in config`)
		return null
	}

	return (
		<div className='flex flex-col gap-8'>
			<SupplyList marketName={marketName} supplyBalances={supplyBalances} />
			<BorrowList marketName={marketName} />
		</div>
	)
}

export default MarketList
