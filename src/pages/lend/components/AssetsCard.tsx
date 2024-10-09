import Card from '@/components/Card/Card'
import Typography from '@/components/Typography'
import React from 'react'
import SupplyList from '@/pages/lend/components/SupplyList'
import { Balance, TotalSupply } from '@/bao/lib/types'

export const AssetsCard = ({
	accountBalances,
	marketName,
	borrowBalances,
	totalSupplies,
}: {
	accountBalances: Balance[]
	marketName: string
	borrowBalances: Balance[]
	totalSupplies: TotalSupply[]
}) => {
	return (
		<>
			<SupplyList accountBalances={accountBalances} borrowBalances={borrowBalances} totalSupplies={totalSupplies} marketName={marketName} />
		</>
	)
}

export default AssetsCard
