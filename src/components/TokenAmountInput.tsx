import { FC, useCallback, useState, useEffect, useRef, memo } from 'react'
import Typography from '@/components/Typography'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from '@ethersproject/bignumber'
import { getDisplayBalance } from '@/utils/numberFormat'

interface TokenAmountInputProps {
	value: string
	onChange: (value: string) => void
	maxAmount: BigNumber
	decimals: number
	symbol: string
	onError?: (error: string) => void
}

const TokenAmountInput: FC<TokenAmountInputProps> = memo(({ value, onChange, maxAmount, decimals, symbol, onError }) => {
	console.log('TokenAmountInput render', { value, maxAmount: maxAmount.toString(), decimals, symbol })

	const [localValue, setLocalValue] = useState(value)
	const [error, setError] = useState('')
	const lastExternalValue = useRef(value)
	const lastOnChange = useRef(onChange)
	const updateTimeoutRef = useRef<NodeJS.Timeout>()

	// Update local value only if external value has changed and is different from local
	useEffect(() => {
		if (value !== lastExternalValue.current && value !== localValue) {
			console.log('TokenAmountInput external value changed', { oldValue: localValue, newValue: value })
			setLocalValue(value)
			lastExternalValue.current = value
		}
	}, [value, localValue])

	// Update onChange ref to prevent stale closures
	useEffect(() => {
		lastOnChange.current = onChange
	}, [onChange])

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		console.log('TokenAmountInput handleInputChange', { newValue })

		// Only allow numbers and decimals
		if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
			setLocalValue(newValue)

			// Debounce the onChange call
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current)
			}

			updateTimeoutRef.current = setTimeout(() => {
				lastOnChange.current(newValue)
			}, 300)
		}
	}, [])

	const handleMaxClick = useCallback(() => {
		const maxValue = getDisplayBalance(maxAmount, decimals)
		console.log('TokenAmountInput handleMaxClick', { maxValue })
		setLocalValue(maxValue)
		lastOnChange.current(maxValue)
	}, [maxAmount, decimals])

	// Validation with cleanup
	useEffect(() => {
		const validateInput = () => {
			console.log('TokenAmountInput validation running', { localValue })
			if (!localValue) {
				setError('')
				onError?.('')
				return
			}

			try {
				const amount = parseUnits(localValue, decimals)
				if (amount.gt(maxAmount)) {
					const newError = 'Amount exceeds balance'
					setError(newError)
					onError?.(newError)
				} else {
					setError('')
					onError?.('')
				}
			} catch (e) {
				const newError = 'Invalid amount'
				setError(newError)
				onError?.(newError)
			}
		}

		const timeoutId = setTimeout(validateInput, 300)
		return () => clearTimeout(timeoutId)
	}, [localValue, decimals, maxAmount, onError])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current)
			}
		}
	}, [])

	return (
		<div className='mb-4'>
			<div className='flex justify-between mb-2'>
				<Typography variant='sm' className='text-baoWhite/60'>
					Available
				</Typography>
				<div className='flex items-center space-x-2'>
					<Typography variant='sm' className='text-baoWhite/60'>
						{getDisplayBalance(maxAmount, decimals)} {symbol}
					</Typography>
					<button type='button' onClick={handleMaxClick} className='text-sm text-baoRed hover:text-baoRed/80'>
						MAX
					</button>
				</div>
			</div>
			<input
				type='text'
				inputMode='decimal'
				value={localValue}
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
	)
})

TokenAmountInput.displayName = 'TokenAmountInput'

export default TokenAmountInput
