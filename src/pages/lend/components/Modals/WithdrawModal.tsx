/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'
import { useBorrowBalances } from '@/hooks/lend/useBorrowBalances'
import { useAccountLiquidity } from '@/hooks/lend/useAccountLiquidity'
import { useComptrollerData } from '@/hooks/lend/useComptrollerData'
import { useOraclePrice } from '@/hooks/lend/useOraclePrice'
import Config from '@/bao/lib/config'

interface WithdrawModalProps {
	show: boolean
	onHide: () => void
	asset: Asset
	marketName: string
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ show, onHide, asset, marketName }) => {
	const { chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const [val, setVal] = useState<string>('')
	const [pending, setPending] = useState<boolean>(false)

	const supplyBalances = useSupplyBalances(marketName)
	const borrowBalances = useBorrowBalances(marketName)
	const operation = 'Withdraw'
	const comptrollerData = useComptrollerData(marketName)
	const { liquidity, borrow } = useAccountLiquidity(marketName)
	const prices = useOraclePrice(marketName)

	const handleChange = useCallback(
		(e: { target: { value: string } }) => {
			setVal(e.target.value)
		},
		[setVal],
	)

	return (
		<Modal isOpen={show} onDismiss={onHide}>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center gap-2'>
					<Image src={asset.icon} alt={asset.name} className='inline-block' height={32} width={32} />
					<Typography variant='xl' className='font-bakbak'>
						{operation} {asset.name}
					</Typography>
				</div>
				{/* ... rest of the modal content ... */}
			</div>
		</Modal>
	)
}

export default WithdrawModal
