import { FC, useCallback, useState, memo, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import Typography from '@/components/Typography'
import TokenAmountInput from '@/components/TokenAmountInput'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from 'ethers/lib/utils'
import { VaultAsset } from '@/bao/lib/types'

interface SupplyModalProps {
	isOpen: boolean
	onClose: () => void
	asset: {
		name: string
		symbol: string
		decimals: number
		balance: string
		supplyAPY?: number
	}
}

const SupplyModal: FC<SupplyModalProps> = memo(({ isOpen, onClose, asset }) => {
	console.log('SupplyModal render', { isOpen, asset })

	const [amount, setAmount] = useState('')
	const [error, setError] = useState('')

	// Track prop changes
	useEffect(() => {
		console.log('SupplyModal props changed', { isOpen, asset })
	}, [isOpen, asset])

	const handleClose = useCallback(() => {
		console.log('SupplyModal handleClose')
		setAmount('')
		setError('')
		onClose()
	}, [onClose])

	const handleAmountChange = useCallback((newAmount: string) => {
		console.log('SupplyModal handleAmountChange', { newAmount })
		setAmount(newAmount)
	}, [])

	const handleSupply = useCallback(() => {
		console.log('SupplyModal handleSupply', { amount, error })
		if (!amount || error) return
		// Handle supply logic here
		handleClose()
	}, [amount, error, handleClose])

	if (!isOpen) return null

	const maxAmount = parseUnits(asset.balance || '0', asset.decimals)
	console.log('SupplyModal calculated maxAmount', { maxAmount: maxAmount.toString() })

	return (
		<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
			<div className='bg-baoBlack/90 backdrop-blur-sm border border-baoWhite/10 rounded-lg w-full max-w-md'>
				<div className='p-6'>
					<div className='flex justify-between items-center mb-6'>
						<Typography variant='h1' className='font-bakbak'>
							Supply {asset.name}
						</Typography>
						<button onClick={handleClose} className='text-baoWhite/60 hover:text-baoWhite'>
							<FontAwesomeIcon icon={faXmark} className='w-6 h-6' />
						</button>
					</div>

					<TokenAmountInput
						value={amount}
						onChange={handleAmountChange}
						maxAmount={maxAmount}
						decimals={asset.decimals}
						symbol={asset.symbol}
						onError={setError}
					/>

					<div className='bg-baoBlack/40 rounded-lg p-4 mb-6'>
						<div className='flex justify-between mb-2'>
							<Typography variant='sm' className='text-baoWhite/60'>
								Supply APY
							</Typography>
							<Typography>{asset.supplyAPY?.toFixed(2)}%</Typography>
						</div>
					</div>

					<button
						className='w-full py-3 bg-baoRed hover:bg-baoRed/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						onClick={handleSupply}
						disabled={!amount || !!error}
					>
						Supply
					</button>
				</div>
			</div>
		</div>
	)
})

SupplyModal.displayName = 'SupplyModal'

export default SupplyModal
