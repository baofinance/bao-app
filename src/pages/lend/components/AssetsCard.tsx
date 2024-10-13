import React from 'react'
import SupplyList from '@/pages/lend/components/SupplyList'
import { Balance, TotalSupply } from '@/bao/lib/types'

export const AssetsCard = ({
	marketName,
	borrowBalances,
	totalSupplies,
}: {
	marketName: string
	borrowBalances: Balance[]
	totalSupplies: TotalSupply[]
}) => {
	return (
		<>
			<SupplyList borrowBalances={borrowBalances} totalSupplies={totalSupplies} marketName={marketName} />
		</>
	)
}

export default AssetsCard
