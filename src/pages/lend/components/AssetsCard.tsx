import React from 'react'
import SupplyList from '@/pages/lend/components/SupplyList'
import { Balance, TotalSupply } from '@/bao/lib/types'

interface AssetsCardProps {
	marketName: string
	supplyBalances: Balance[]
	totalSupplies: TotalSupply[]
}

const AssetsCard: React.FC<AssetsCardProps> = ({ marketName, supplyBalances, totalSupplies }) => {
	return (
		<>
			<SupplyList supplyBalances={supplyBalances} marketName={marketName} />
		</>
	)
}

export default AssetsCard
