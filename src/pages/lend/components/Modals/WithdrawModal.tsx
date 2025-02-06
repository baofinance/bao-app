import { FC, useEffect, useMemo, useState, useCallback } from 'react'
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

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setVal('')
			setError('')
			setLoading(false)
		}
	}, [isOpen])

	// Memoize contracts to prevent unnecessary re-renders
	const ctokenContract = useMemo(() => {
		if (!activeMarket || !asset) return null
		return activeMarket.find(m => m.ctokenAddress.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())?.ctokenContract
	}, [activeMarket, asset, chainId])

	const supplyApy = useMemo(() => {
		if (!supplyApys || !asset) return null
		return supplyApys[asset.underlyingAddress[chainId]]
	}, [supplyApys, asset, chainId])

	// Memoize handlers to prevent unnecessary re-renders
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		// Only allow numbers and decimals
		if (value === '' || /^\d*\.?\d*$/.test(value)) {
			setVal(value)
		}
	}, [])

	const handleMaxClick = useCallback(() => {
		const maxValue = getDisplayBalance(maxWithdraw, asset.underlyingDecimals)
		setVal(maxValue)
	}, [maxWithdraw, asset.underlyingDecimals])

	// Debounced validation
	useEffect(() => {
		if (!isOpen) return // Don't validate if modal is closed

		const validateInput = () => {
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
		}

		const timeoutId = setTimeout(validateInput, 300)
		return () => clearTimeout(timeoutId)
	}, [val, asset.underlyingDecimals, maxWithdraw, isOpen])

	const handleDismiss = useCallback(() => {
		setVal('')
		setError('')
		setLoading(false)
		onDismiss()
	}, [onDismiss])

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
		<Modal isOpen={isOpen} onDismiss={handleDismiss}>
			<div className='p-4' onClick={e => e.stopPropagation()}>
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
						<div className='flex items-center space-x-2'>
							<Typography variant='sm' className='text-baoWhite/60'>
								{getDisplayBalance(maxWithdraw, asset.underlyingDecimals)}
							</Typography>
							<button type='button' onClick={handleMaxClick} className='text-sm text-baoRed hover:text-baoRed/80'>
								MAX
							</button>
						</div>
					</div>
					<input
						type='text'
						inputMode='decimal'
						value={val}
						onChange={handleInputChange}
						placeholder='0.0'
						className='w-full p-2 rounded bg-baoBlack/40 border border-baoWhite/10 text-white'
						autoComplete='off'
						pattern='^[0-9]*[.,]?[0-9]*$'
						spellCheck='false'
						autoCorrect='off'
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
