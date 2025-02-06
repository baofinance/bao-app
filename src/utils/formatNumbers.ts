/**
 * Format a number to a human readable string
 * @param value The number to format
 * @param decimals Number of decimal places (optional)
 * @returns Formatted string
 */
export function formatNumber(value: number | string | undefined, decimals?: number): string {
	if (value === undefined || value === null) return '0'

	const num = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(num)) return '0'

	// For very small numbers (less than 0.001)
	if (Math.abs(num) < 0.001 && num !== 0) {
		return '<0.001'
	}

	// For numbers >= 1M
	if (Math.abs(num) >= 1e6) {
		return (num / 1e6).toFixed(2) + 'M'
	}

	// For numbers >= 1K
	if (Math.abs(num) >= 1e3) {
		return (num / 1e3).toFixed(2) + 'K'
	}

	// Use provided decimals or auto-determine
	if (decimals !== undefined) {
		return num.toFixed(decimals)
	}

	// For numbers between 0.001 and 1000
	if (num >= 100) return num.toFixed(2)
	if (num >= 10) return num.toFixed(3)
	if (num >= 1) return num.toFixed(4)
	return num.toFixed(6)
}

/**
 * Format a USD value
 * @param value The USD value
 * @param decimals Number of decimal places (optional)
 * @returns Formatted USD string
 */
export function formatUSD(value: number | string | undefined, decimals?: number): string {
	if (!value) return '$0.00'
	const num = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(num)) return '$0.00'

	// For very small amounts
	if (Math.abs(num) < 0.01) {
		return '<$0.01'
	}

	// For values >= 1M
	if (Math.abs(num) >= 1e6) {
		return '$' + (num / 1e6).toFixed(2) + 'M'
	}

	// For values >= 1K
	if (Math.abs(num) >= 1e3) {
		return '$' + (num / 1e3).toFixed(2) + 'K'
	}

	// For values < 1K
	return '$' + num.toFixed(decimals || 2)
}

/**
 * Format a token amount
 * @param value The token amount
 * @param maxDecimals Maximum decimal places (optional)
 * @returns Formatted token amount string
 */
export function formatTokenAmount(value: number | string | undefined, maxDecimals = 6): string {
	if (!value) return '0'
	const num = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(num)) return '0'

	// For very small numbers
	if (Math.abs(num) < 0.000001) {
		return '<0.000001'
	}

	// For numbers >= 1M
	if (Math.abs(num) >= 1e6) {
		return (num / 1e6).toFixed(2) + 'M'
	}

	// For numbers >= 1K
	if (Math.abs(num) >= 1e3) {
		return (num / 1e3).toFixed(2) + 'K'
	}

	// Determine appropriate decimals based on number size
	let decimals = maxDecimals
	if (num >= 100) decimals = Math.min(2, maxDecimals)
	else if (num >= 10) decimals = Math.min(3, maxDecimals)
	else if (num >= 1) decimals = Math.min(4, maxDecimals)

	return num.toFixed(decimals)
}

/**
 * Format a percentage value
 * @param value The percentage value
 * @param decimals Number of decimal places (optional)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number | string | undefined, decimals = 2): string {
	if (!value) return '0%'
	const num = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(num)) return '0%'

	// For very small percentages
	if (Math.abs(num) < 0.01) {
		return '<0.01%'
	}

	// For normal percentages
	return num.toFixed(decimals) + '%'
}

/**
 * Format a currency value
 * @param value The currency value
 * @param decimals Number of decimal places (default: 2)
 * @param currency The currency symbol (default: '$')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string | undefined, decimals = 2, currency = '$'): string {
	const formatted = formatNumber(value, decimals)
	return `${currency}${formatted}`
}

/**
 * Format a value to compact notation
 * @param num The number to format
 * @returns Formatted compact string
 */
export const formatCompactNumber = (num: number) => {
	if (!num || isNaN(num)) return '0'

	// Handle small non-zero numbers
	if (num > 0 && num < 0.01) {
		return '<0.01'
	}

	const absNum = Math.abs(num)
	if (absNum >= 1e9) {
		return (num / 1e9).toFixed(2) + 'b'
	}
	if (absNum >= 1e6) {
		return (num / 1e6).toFixed(2) + 'm'
	}
	if (absNum >= 1e3) {
		return (num / 1e3).toFixed(2) + 'k'
	}
	return num.toFixed(2)
}

/**
 * Format a number to compact currency notation
 * @param num The number to format
 * @returns Formatted compact currency string
 */
export const formatCompactCurrency = (num: number) => {
	if (!num || isNaN(num)) return '$0'

	// Handle small non-zero numbers
	if (num > 0 && num < 0.01) {
		return '<$0.01'
	}

	const absNum = Math.abs(num)
	if (absNum >= 1e9) {
		return '$' + (num / 1e9).toFixed(2) + 'b'
	}
	if (absNum >= 1e6) {
		return '$' + (num / 1e6).toFixed(2) + 'm'
	}
	if (absNum >= 1e3) {
		return '$' + (num / 1e3).toFixed(2) + 'k'
	}
	return '$' + num.toFixed(2)
}

/**
 * Format a number to compact percentage notation
 * @param num The number to format
 * @returns Formatted compact percentage string
 */
export const formatCompactPercent = (num: number): string => {
	return formatCompactNumber(num) + '%'
}

/**
 * Format a value to compact notation with custom decimals
 * @param value The value to format
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted compact string
 */
export function formatCompact(value: number | string | undefined, decimals = 1): string {
	if (value === undefined || value === null) return '0'
	const num = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(num)) return '0'
	return new Intl.NumberFormat('en-US', {
		notation: 'compact',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(num)
}
