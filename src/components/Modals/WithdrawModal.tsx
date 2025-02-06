import { FC, useCallback, useState, memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import Typography from '@/components/Typography'
import TokenAmountInput from '@/components/TokenAmountInput'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from 'ethers/lib/utils'

interface WithdrawModalProps {
	isOpen: boolean
	onClose: () => void
	asset: {
		name: string
		symbol: string
		decimals: number
		supplyBalance: string
	}
}

const WithdrawModal: FC<WithdrawModalProps> = memo(({ isOpen, onClose, asset }) => {
	const [amount, setAmount] = useState('')
	const [error, setError] = useState('')

	const handleClose = useCallback(() => {
		setAmount('')
		setError('')
		onClose()
	}, [onClose])

	const handleWithdraw = useCallback(() => {
		if (!amount || error) return
		// Handle withdraw logic here
		handleClose()
	}, [amount, error, handleClose])

	if (!isOpen) return null

	const maxAmount = parseUnits(asset.supplyBalance || '0', asset.decimals)

	return (
		<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
			<div className='bg-baoBlack/90 backdrop-blur-sm border border-baoWhite/10 rounded-lg w-full max-w-md'>
				<div className='p-6'>
					<div className='flex justify-between items-center mb-6'>
						<Typography variant='h1' className='font-bakbak'>
							Withdraw {asset.name}
						</Typography>
						<button onClick={handleClose} className='text-baoWhite/60 hover:text-baoWhite'>
							<FontAwesomeIcon icon={faXmark} className='w-6 h-6' />
						</button>
					</div>

					<TokenAmountInput
						value={amount}
						onChange={setAmount}
						maxAmount={maxAmount}
						decimals={asset.decimals}
						symbol={asset.symbol}
						onError={setError}
					/>

					<button
						className='w-full py-3 bg-baoRed hover:bg-baoRed/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						onClick={handleWithdraw}
						disabled={!amount || !!error}
					>
						Withdraw
					</button>
				</div>
			</div>
		</div>
	)
})

WithdrawModal.displayName = 'WithdrawModal'

export default WithdrawModal
