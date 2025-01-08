import { FC, useEffect, useMemo, useState } from 'react'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { useActiveLendMarket } from '@/hooks/lend/useActiveLendMarket'
import { useSupplyApy } from '@/hooks/lend/useSupplyApy'
import { getDisplayBalance } from '@/utils/numberFormat'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from '@ethersproject/bignumber'
import Image from 'next/future/image'
import { VaultAsset } from '@/bao/lib/types'

interface WithdrawModalProps {
	isOpen: boolean
	onDismiss: () => void
	marketName: string
	asset: VaultAsset
	maxWithdraw: BigNumber
}

const WithdrawModal: FC<WithdrawModalProps> = ({ isOpen, onDismiss, marketName, asset, maxWithdraw }) => {
	const { account, chainId } = useWeb3React()
	const [val, setVal] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [loading, setLoading] = useState(false)

	const market = Config.vaults[marketName]
	const activeMarket = useActiveLendMarket(marketName)
	const supplyApys = useSupplyApy(marketName)

	const ctokenContract = useMemo(() => {
		if (!activeMarket || !asset) return null
		return activeMarket.find(m => m.ctokenAddress.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())?.ctokenContract
	}, [activeMarket, asset, chainId])

	const supplyApy = useMemo(() => {
		if (!supplyApys || !asset) return null
		return supplyApys[asset.underlyingAddress[chainId]]
	}, [supplyApys, asset, chainId])

	useEffect(() => {
		if (!val) {
			setError('')
			return
		}

		try {
			const amount = parseUnits(val, asset.underlyingDecimals)
			if (amount.gt(maxWithdraw)) {
				setError('Amount exceeds available balance')
			} else {
				setError('')
			}
		} catch (e) {
			setError('Invalid amount')
		}
	}, [val, asset, maxWithdraw])

	const handleWithdraw = async () => {
		if (!account || !ctokenContract || error) return

		try {
			setLoading(true)
			const amount = parseUnits(val, asset.underlyingDecimals)
			const tx = await ctokenContract.redeemUnderlying(amount)
			await tx.wait()
			onDismiss()
		} catch (e) {
			console.error('Error withdrawing:', e)
			setError('Failed to withdraw')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onDismiss={onDismiss}>
			<div className='p-4'>
				<Typography variant='lg' className='mb-4 text-center font-bakbak'>
					Withdraw {asset.name}
				</Typography>

				<div className='flex items-center space-x-3 mb-4'>
					<div className='w-10 h-10 rounded-full bg-baoBlack/60 border border-baoWhite/10 overflow-hidden'>
						<Image src={asset.icon} alt={asset.name} width={40} height={40} />
					</div>
					<div>
						<Typography variant='lg' className='font-bakbak'>
							{asset.name}
						</Typography>
						{supplyApy && (
							<Typography variant='sm' className='text-baoWhite/60'>
								APY: {supplyApy.toFixed(2)}%
							</Typography>
						)}
					</div>
				</div>

				<div className='mb-4'>
					<div className='flex justify-between mb-2'>
						<Typography variant='sm' className='text-baoWhite/60'>
							Available
						</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							{getDisplayBalance(maxWithdraw, asset.underlyingDecimals)}
						</Typography>
					</div>
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
					onClick={handleWithdraw}
					disabled={!account || !!error || loading || !val}
					className='w-full p-2 rounded bg-baoRed text-white font-bakbak disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{loading ? 'Withdrawing...' : 'Withdraw'}
				</button>
			</div>
		</Modal>
	)
}

export default WithdrawModal
