import { FC, useEffect, useMemo, useState } from 'react'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { useActiveLendMarket } from '@/hooks/lend/useActiveLendMarket'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { getDisplayBalance } from '@/utils/numberFormat'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from '@ethersproject/bignumber'
import Image from 'next/future/image'
import { VaultAsset } from '@/bao/lib/types'

interface BorrowModalProps {
	isOpen: boolean
	onDismiss: () => void
	marketName: string
	asset: VaultAsset
}

const BorrowModal: FC<BorrowModalProps> = ({ isOpen, onDismiss, marketName, asset }) => {
	const { account, chainId } = useWeb3React()
	const [val, setVal] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [loading, setLoading] = useState(false)

	const market = Config.vaults[marketName]
	const activeMarket = useActiveLendMarket(marketName)
	const borrowApys = useBorrowApy(marketName)

	const ctokenContract = useMemo(() => {
		if (!activeMarket || !asset) return null
		return activeMarket.find(m => m.ctokenAddress.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())?.ctokenContract
	}, [activeMarket, asset, chainId])

	const borrowApy = useMemo(() => {
		if (!borrowApys || !asset) return null
		return borrowApys[asset.underlyingAddress[chainId]]
	}, [borrowApys, asset, chainId])

	useEffect(() => {
		if (!val) {
			setError('')
			return
		}

		try {
			const amount = parseUnits(val, asset.underlyingDecimals)
			if (asset.minimumBorrow && amount.lt(BigNumber.from(asset.minimumBorrow))) {
				setError(`Minimum borrow amount is ${asset.minimumBorrow}`)
			} else {
				setError('')
			}
		} catch (e) {
			setError('Invalid amount')
		}
	}, [val, asset])

	const handleBorrow = async () => {
		if (!account || !ctokenContract || error) return

		try {
			setLoading(true)
			const amount = parseUnits(val, asset.underlyingDecimals)
			const tx = await ctokenContract.borrow(amount)
			await tx.wait()
			onDismiss()
		} catch (e) {
			console.error('Error borrowing:', e)
			setError('Failed to borrow')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onDismiss={onDismiss}>
			<div className='p-4'>
				<Typography variant='lg' className='mb-4 text-center font-bakbak'>
					Borrow {asset.name}
				</Typography>

				<div className='flex items-center space-x-3 mb-4'>
					<div className='w-10 h-10 rounded-full bg-baoBlack/60 border border-baoWhite/10 overflow-hidden'>
						<Image src={asset.icon} alt={asset.name} width={40} height={40} />
					</div>
					<div>
						<Typography variant='lg' className='font-bakbak'>
							{asset.name}
						</Typography>
						{borrowApy && (
							<Typography variant='sm' className='text-baoWhite/60'>
								APR: {borrowApy.toFixed(2)}%
							</Typography>
						)}
					</div>
				</div>

				<div className='mb-4'>
					<input
						type='number'
						value={val}
						onChange={e => setVal(e.target.value)}
						placeholder='Enter amount'
						className='w-full p-2 rounded bg-baoBlack/40 border border-baoWhite/10 text-white'
					/>
					{error && (
						<Typography variant='sm' className='text-baoRed mt-1'>
							{error}
						</Typography>
					)}
				</div>

				<button
					onClick={handleBorrow}
					disabled={!account || !!error || loading || !val}
					className='w-full p-2 rounded bg-baoRed text-white font-bakbak disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{loading ? 'Borrowing...' : 'Borrow'}
				</button>
			</div>
		</Modal>
	)
}

export default BorrowModal
