import React from 'react'
import SupplyList from '@/pages/lend/components/SupplyList'
import { Balance, TotalSupply } from '@/bao/lib/types'

export const AssetsCard = ({
	marketName,
	supplyBalances,
	totalSupplies,
}: {
	marketName: string
	supplyBalances: Balance[]
	totalSupplies: TotalSupply[]
}) => {
	return (
		<>
			<SupplyList supplyBalances={supplyBalances} totalSupplies={totalSupplies} marketName={marketName} />
		</>
	)
}

export default AssetsCard
