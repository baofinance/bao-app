import { FC } from 'react'
import { useTotalBorrow } from '@/hooks/lend/useTotalBorrow'
import { useEffect } from 'react'

interface AssetBorrowAmountProps {
	marketName: string
	ctokenAddress: { [key: number]: string }
	onBorrowUpdate: (amount: string) => void
}

const AssetBorrowAmount: FC<AssetBorrowAmountProps> = ({ marketName, ctokenAddress, onBorrowUpdate }) => {
	const { data: borrowAmount } = useTotalBorrow(marketName, [ctokenAddress])

	useEffect(() => {
		if (borrowAmount) {
			onBorrowUpdate(borrowAmount)
		}
	}, [borrowAmount, onBorrowUpdate])

	// This component doesn't render anything visible
	return null
}

export default AssetBorrowAmount
