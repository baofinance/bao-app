import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faChevronDown, faInfoCircle, faXmark } from '@fortawesome/free-solid-svg-icons'
import Config from '@/bao/lib/config'
import { useAccountBalances, useWalletBalances } from '@/hooks/lend/useAccountBalances'
import { useMarketTotals } from '@/hooks/lend/useMarketTotals'
import { useState, useRef, useEffect, useMemo, useCallback, memo, useReducer } from 'react'
import { useWeb3React } from '@web3-react/core'
import AccountButton from '@/components/AccountButton'
import { ethers } from 'ethers'
import { useTokenPrices } from '@/hooks/lend/useTokenPrices'
import { BigNumber } from 'bignumber.js'
import { useSupplyRate } from '@/hooks/lend/useSupplyRate'
import { Tooltip } from '@/components/Tooltip'
import { Balance as BaoBalance, ActiveVaultAsset, VaultAsset } from '@/bao/lib/types'
import { useBorrowRate } from '@/hooks/lend/useBorrowRate'
import { formatUnits } from 'ethers/lib/utils'
import { formatPercent } from '@/utils/formatNumbers'
import { useMarketData } from '@/hooks/lend/useMarketData'
import { useDefiLlamaApy } from '@/hooks/lend/useDefiLlamaApy'
import Tooltipped from '@/components/Tooltipped/Tooltipped'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { useCollateralFactors } from '@/hooks/lend/useCollateralFactors'
import { Contract } from 'ethers'
import { useTotalBorrow } from '@/hooks/lend/useTotalBorrow'
import useAssetBorrows from '@/hooks/lend/useAssetBorrows'
import AssetBorrowAmount from '@/components/AssetBorrowAmount'
import { formatNumber, formatUSD, formatTokenAmount, formatCompactNumber, formatCompactCurrency } from '@/utils/formatNumbers'
import { Web3Provider } from '@ethersproject/providers'
import { createPortal } from 'react-dom'
import SupplyModal from '@/components/Modals/SupplyModal'
import WithdrawModal from '@/components/Modals/WithdrawModal'

// Base types
type Tab = 'supplies' | 'borrows'

type AssetSummary = {
	totalBalance: number
	totalAPY: number
}

interface BaseVaultAsset {
	id: number
	name: string
	symbol: string
	icon: string
	ctokenAddress: Record<number, string>
	underlyingAddress: Record<number, string>
	underlyingDecimals: number
	supply: boolean
	borrow: boolean
}

interface SelectedAsset {
	id?: number
	name?: string
	symbol?: string
	icon?: string
	balance?: string
	available?: string
	supplyBalance?: string
	borrowBalance?: string
	supplyAPY?: number
	borrowAPY?: number
	address?: string
	ctokenAddress?: Record<number, string>
	underlyingAddress?: Record<number, string>
	asset?: VaultAsset
}

interface ExtendedVaultAsset extends BaseVaultAsset {
	balance?: string
	available?: string
	supplyBalance?: string
	borrowBalance?: string
	supplyAPY?: number
	borrowAPY?: number
	address: string
}

interface Balance {
	address: string
	balance: string
	exchangeRate: string
	borrowBalance: string
	supplyBalance: string
	decimals: number
	asset: VaultAsset
	symbol: string
}

interface ExtendedBalance extends Balance {
	balanceValue: number
	usdValue: number
}

interface AccountBalancesResult {
	balances: ExtendedBalance[]
	isLoading: boolean
	error?: Error
}

interface WalletBalance {
	balance: string
	decimals: number
}

interface WalletBalances {
	[key: string]: WalletBalance
}

interface WalletBalancesResult {
	walletBalances: WalletBalances
	isLoading: boolean
}

interface SupplyRate {
	totalApy: string
	lendingApy: string
	underlyingApy: string
}

interface MarketTotal {
	asset: VaultAsset
	supply: number
	borrow: number
	price: number
	supplyAPY: number
	borrowAPY: number
}

interface AddressWithLlamaId {
	ctokenAddress: Record<number, string>
	llamaId: string
}

// Add these utility functions at the top of the file after imports
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_RETRIES = 3
const MAX_RETRY_DELAY = 10000 // 10 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const withRetry = async <T,>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> => {
	try {
		return await fn()
	} catch (error: any) {
		// Check for rate limit error (429)
		const isRateLimit =
			(error?.code === -32000 && error?.message?.includes('429')) || error?.message?.includes('429') || error?.status === 429

		if (retries > 0 && isRateLimit) {
			console.log(`Rate limited, retrying in ${delay}ms... (${retries} retries left)`)
			await sleep(delay)
			// Exponential backoff with max delay
			const nextDelay = Math.min(delay * 2, MAX_RETRY_DELAY)
			return withRetry(fn, retries - 1, nextDelay)
		}
		throw error
	}
}

// Add the formatBalance function before useAccountBalancesWithRetry
const formatBalance = (balance: string, exchangeRate: string, decimals: number, isBorrow: boolean = false): number => {
	if (!balance || !exchangeRate) return 0
	try {
		const balanceNum = parseFloat(formatUnits(balance, decimals))
		const exchangeRateNum = parseFloat(formatUnits(exchangeRate, 18))
		return isBorrow ? balanceNum : balanceNum * exchangeRateNum
	} catch (error) {
		console.error('Error formatting balance:', error)
		return 0
	}
}

// Wrap the useAccountBalances hook to use withRetry
const useAccountBalancesWithRetry = (marketName: string): AccountBalancesResult => {
	const result = useAccountBalances(marketName) as unknown as {
		balances: Balance[]
		isLoading: boolean
	}
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		const fetchWithRetry = async () => {
			try {
				await withRetry(async () => {
					return result
				})
				setError(null)
			} catch (err) {
				console.error('Account balances error:', err)
				setError(err as Error)
			}
		}

		fetchWithRetry()
	}, [result])

	// Transform balances to ExtendedBalance type
	const extendedBalances = result.balances.map((balance: Balance) => ({
		...balance,
		balanceValue: balance.balance ? formatBalance(balance.balance, balance.exchangeRate, balance.decimals, false) : 0,
		usdValue: 0,
	})) as ExtendedBalance[]

	return { balances: extendedBalances, isLoading: result.isLoading, error: error || undefined }
}

const useSupplyRates = (addresses: { ctokenAddress: Record<number, string>; llamaId?: string }[], marketName: string) => {
	const { chainId = Config.networkId } = useWeb3React()

	// Create the addresses map first
	const addressesMap = addresses.reduce<Record<string, string>>(
		(acc, { ctokenAddress }) => ({
			...acc,
			...ctokenAddress,
		}),
		{},
	)

	// Call all hooks at the top level
	const marketData = useMarketData(marketName, addressesMap)

	// Call individual hooks for each possible address
	const llamaApy0 = useDefiLlamaApy(addresses[0]?.llamaId || '') || 0
	const llamaApy1 = useDefiLlamaApy(addresses[1]?.llamaId || '') || 0
	const llamaApy2 = useDefiLlamaApy(addresses[2]?.llamaId || '') || 0
	const llamaApy3 = useDefiLlamaApy(addresses[3]?.llamaId || '') || 0
	const llamaApy4 = useDefiLlamaApy(addresses[4]?.llamaId || '') || 0

	return useMemo(() => {
		const ratesMap: Record<string, SupplyRate> = {}

		addresses.forEach(({ ctokenAddress }, index) => {
			const address = ctokenAddress[chainId]
			if (!address || !marketData?.supplyRate) return

			const supplyRatePerBlock = Number(marketData.supplyRate) / 1e18
			const lendingApy = (Math.pow(1 + supplyRatePerBlock, 2628000) - 1) * 100
			const underlyingApy = [llamaApy0, llamaApy1, llamaApy2, llamaApy3, llamaApy4][index] || 0
			const totalApy = (lendingApy || 0) + (underlyingApy || 0)

			ratesMap[address] = {
				totalApy: totalApy.toFixed(4),
				lendingApy: (lendingApy || 0).toFixed(4),
				underlyingApy: (underlyingApy || 0).toFixed(4),
			}
		})

		return ratesMap
	}, [addresses, chainId, marketData, llamaApy0, llamaApy1, llamaApy2, llamaApy3, llamaApy4])
}

const PositionsPage: NextPage = () => {
	const { account, chainId } = useWeb3React()
	const router = useRouter()
	const { market: marketName } = router.query
	const market = marketName ? Config.vaults[marketName as string] : null
	const { balances, isLoading } = useAccountBalancesWithRetry(marketName as string) as {
		balances: Array<{
			address: string
			borrowBalance: string
			supplyBalance: string
			asset: VaultAsset
		}>
		isLoading: boolean
	}
	const marketTotals = useMarketTotals(marketName as string) as Array<MarketTotal>
	const { walletBalances, isLoading: walletBalancesLoading } = useWalletBalances(marketName as string) as {
		walletBalances: Record<string, WalletBalance>
		isLoading: boolean
	}
	const { tokenPrices } = useTokenPrices()
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<Tab>('supplies')
	const dropdownRef = useRef<HTMLDivElement>(null)
	const [showArchivedAssets, setShowArchivedAssets] = useState(false)
	const [isRiskDetailsOpen, setIsRiskDetailsOpen] = useState(false)
	const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false)
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
	const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
	const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false)
	const { library } = useWeb3React()

	// Add borrowApys at the top level with other hooks
	const borrowApys = useBorrowApy(marketName as string)

	// Replace the old collateral factors code with this
	const collateralFactors = useCollateralFactors(marketName as string)

	// Update the getAssetCollateralFactor function to use the mapping
	const getAssetCollateralFactor = (asset: any) => {
		if (!chainId || !asset?.ctokenAddress?.[chainId]) return 0
		const factor = collateralFactors[asset.ctokenAddress[chainId].toLowerCase()]
		return factor ? Number(factor) * 100 : 0
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleMarketChange = (newMarketName: string) => {
		router.push(`/lend/${newMarketName}/positions`)
		setIsDropdownOpen(false)
	}

	const formatBalance = (balance: string, exchangeRate: string, decimals: number, isBorrow: boolean = false): number => {
		try {
			const balanceBN = ethers.BigNumber.from(balance)
			const exchangeRateBN = ethers.BigNumber.from(exchangeRate)

			// For borrow balances, we don't need to apply the exchange rate
			if (isBorrow) {
				return parseFloat(ethers.utils.formatUnits(balanceBN, decimals))
			}

			// For supply balances, we need to apply the exchange rate
			const balanceUnderlying = balanceBN.mul(exchangeRateBN).div(ethers.constants.WeiPerEther)
			return parseFloat(ethers.utils.formatUnits(balanceUnderlying, decimals))
		} catch (error) {
			console.error('Error formatting balance:', {
				balance,
				exchangeRate,
				decimals,
				isBorrow,
				error,
			})
			return 0
		}
	}

	const formatUSD = (value: number) => {
		return `$${value.toFixed(2)}`
	}

	// Update the formatTokenAmount function to handle BigNumber values
	const formatTokenAmount = (value: string | ethers.BigNumber | number) => {
		if (!value) return '0'
		let num: number

		if (ethers.BigNumber.isBigNumber(value)) {
			// If it's a BigNumber, convert it using the appropriate decimals
			num = parseFloat(ethers.utils.formatUnits(value, 18))
		} else if (typeof value === 'string') {
			// If it's a string that might be a BigNumber
			try {
				const bn = ethers.BigNumber.from(value)
				num = parseFloat(ethers.utils.formatUnits(bn, 18))
			} catch {
				// If it's not a valid BigNumber string, treat it as a regular number
				num = parseFloat(value)
			}
		} else {
			num = value
		}

		if (isNaN(num)) return '0'
		return formatCompactNumber(num)
	}

	// Update the formatLTV function to limit decimals
	const formatLTV = (value: number) => {
		return value.toFixed(2) + '%'
	}

	// Update the formatAPY function to limit decimals
	const formatAPY = (value: number) => {
		return formatPercent(value)
	}

	const calculateAssetSummary = () => {
		if (!balances) return { totalBalance: 0, totalAPY: 0 }

		const totalBalance = getSupplies.reduce((total, supply) => total + (supply.usdValue || 0), 0)

		// Calculate weighted APY
		let totalWeightedAPY = 0

		getSupplies.forEach(supply => {
			if (!supply.usdValue || supply.usdValue === 0) return

			const rate = supplyRates[supply.asset?.ctokenAddress?.[chainId]] || { totalApy: '0' }
			const apy = Number(rate.totalApy)
			const weight = supply.usdValue / totalBalance
			totalWeightedAPY += apy * weight
		})

		return {
			totalBalance,
			totalAPY: totalWeightedAPY,
		}
	}

	const isArchivedAsset = (asset: any) => {
		return asset.active === false
	}

	// Get unique addresses first, with proper type checking
	const ctokenAddresses = useMemo(() => {
		if (!balances || !market) return []
		return [
			...new Set(
				balances
					.filter(balance => {
						const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
						return asset?.supply && balance.balance && Number(balance.balance) > 0
					})
					.map(balance => {
						const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
						if (!asset?.ctokenAddress) return null
						return {
							ctokenAddress: asset.ctokenAddress,
							llamaId: asset.llamaId,
						}
					})
					.filter((item): item is { ctokenAddress: { [key: number]: string }; llamaId?: string } => item !== null),
			),
		]
	}, [balances, market, chainId])

	// First, get supplies separately from rates
	const getSupplies = useMemo(() => {
		if (!balances || !market) return []

		return balances
			.filter(balance => {
				const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
				return asset?.supply && balance.balance && Number(balance.balance) > 0
			})
			.map(balance => {
				const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
				const balanceValue = formatBalance(balance.balance, balance.exchangeRate, balance.decimals, false)
				const marketTotal = marketTotals?.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
				const usdValue = balanceValue * (marketTotal?.price || 0)

				return {
					...balance,
					balanceValue,
					usdValue,
					asset,
				}
			})
	}, [balances, market, chainId, marketTotals])

	// Get rates for all supplies at once
	const supplyRates = useSupplyRates(ctokenAddresses, marketName as string)

	const calculateNetWorth = () => {
		if (!balances || !market || !marketTotals) return 0

		// Calculate total supply value
		const totalSupplyValue = getSupplies.reduce((sum, supply) => sum + (supply.usdValue || 0), 0)

		// Calculate total borrow value
		const totalBorrowValue = balances.reduce((sum, balance) => {
			const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			if (!asset || !balance.borrowBalance) return sum

			const balanceValue = ethers.utils.formatUnits(balance.borrowBalance, asset.underlyingDecimals)
			const marketTotal = marketTotals.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			return sum + Number(balanceValue) * (marketTotal?.price || 0)
		}, 0)

		// Net worth = Supply - Borrow
		return totalSupplyValue - totalBorrowValue
	}

	const calculateNetAPY = () => {
		if (!balances || !market || !marketTotals) return 0

		let totalSupplyUSD = 0
		let totalBorrowUSD = 0
		let weightedSupplyAPY = 0
		let weightedBorrowAPY = 0

		// Calculate total USD values and weighted APYs for supplies
		getSupplies.forEach(supply => {
			if (!supply.asset || !supply.usdValue) return
			totalSupplyUSD += supply.usdValue

			// Get supply APY for this asset
			const rate = supplyRates[supply.asset.ctokenAddress[chainId]]
			if (rate) {
				const supplyAPY = Number(rate.totalApy)
				weightedSupplyAPY += supplyAPY * supply.usdValue
			}
		})

		// Calculate total USD values and weighted APYs for borrows
		balances.forEach(balance => {
			const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			if (!asset || !balance.borrowBalance || Number(balance.borrowBalance) === 0) return

			const balanceValue = ethers.utils.formatUnits(balance.borrowBalance, asset.underlyingDecimals)
			const marketTotal = marketTotals.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			const usdValue = Number(balanceValue) * (marketTotal?.price || 0)
			totalBorrowUSD += usdValue

			// Get borrow APY for this asset
			const borrowAPY = borrowApys[asset.underlyingAddress[chainId]] || 0
			weightedBorrowAPY += Math.abs(borrowAPY) * usdValue // Make sure we use absolute value for borrow APY
		})

		// Calculate blended APYs
		const blendedSupplyAPY = totalSupplyUSD > 0 ? weightedSupplyAPY / totalSupplyUSD : 0
		const blendedBorrowAPY = totalBorrowUSD > 0 ? weightedBorrowAPY / totalBorrowUSD : 0

		// If we have no positions, return 0
		if (totalSupplyUSD === 0) return 0

		// Calculate net APY using blended rates
		// Net APY = (Supply USD × Supply APY - Borrow USD × Borrow APY) / Supply USD
		const netAPY = (totalSupplyUSD * blendedSupplyAPY - totalBorrowUSD * blendedBorrowAPY) / totalSupplyUSD

		return netAPY
	}

	const calculateHealthFactor = () => {
		if (!balances || !market || !marketTotals) return 0

		let totalWeightedCollateralUSD = 0
		let totalBorrowedUSD = 0

		// Calculate total weighted collateral value
		getSupplies.forEach(supply => {
			if (!supply.asset || !supply.usdValue) return

			// Get collateral factor for this asset
			const assetAddress = supply.asset.ctokenAddress[chainId]?.toLowerCase()
			if (!assetAddress) return

			// Get collateral factor from our hook (as decimal)
			const collateralFactor = collateralFactors[assetAddress]
			if (!collateralFactor) return

			// Convert collateral factor from string to number (it's stored as decimal, e.g., "0.8" for 80%)
			const collateralFactorNum = Number(collateralFactor)

			// Add to total weighted collateral
			totalWeightedCollateralUSD += supply.usdValue * collateralFactorNum
		})

		// Calculate total borrowed value
		balances.forEach(balance => {
			const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			if (!asset || !balance.borrowBalance) return

			const balanceValue = ethers.utils.formatUnits(balance.borrowBalance, asset.underlyingDecimals)
			const marketTotal = marketTotals.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			const usdValue = Number(balanceValue) * (marketTotal?.price || 0)

			totalBorrowedUSD += usdValue
		})

		// Calculate health factor
		// If no borrows, return a high number to indicate very healthy position
		if (totalBorrowedUSD === 0) return 100

		// Health factor = (Total Weighted Collateral in USD) / (Total Borrowed in USD)
		const healthFactor = totalWeightedCollateralUSD / totalBorrowedUSD

		console.log('Health Factor Calculation:', {
			totalWeightedCollateralUSD,
			totalBorrowedUSD,
			healthFactor,
		})

		return Number(healthFactor.toFixed(2))
	}

	// Update calculateBorrowSummary to take borrowApys as a parameter
	const calculateBorrowSummary = (
		balances: Array<{
			address: string
			borrowBalance: string
			supplyBalance: string
			asset: VaultAsset
		}>,
	) => {
		if (!balances || !market || !marketTotals) return { totalBorrowed: 0, borrowAPY: 0, borrowPowerUsed: 0 }

		let totalBorrowed = 0
		let totalWeightedAPY = 0

		// Get all borrow positions
		balances.forEach(balance => {
			const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			if (!asset || !balance.borrowBalance || balance.borrowBalance === '0') return

			// Format the borrow balance using the asset's decimals
			const balanceValue = Number(ethers.utils.formatUnits(balance.borrowBalance, asset.underlyingDecimals))
			const marketTotal = marketTotals.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			const usdValue = balanceValue * (marketTotal?.price || 0)

			console.log('Borrow position calculation:', {
				asset: asset.name,
				rawBalance: balance.borrowBalance,
				formattedBalance: balanceValue,
				price: marketTotal?.price,
				usdValue,
				underlyingDecimals: asset.underlyingDecimals,
			})

			if (usdValue > 0) {
				totalBorrowed += usdValue

				// Get borrow APY for this asset from the passed in borrowApys
				const assetBorrowAPY = borrowApys[asset.underlyingAddress[chainId]] || 0

				// Calculate weighted APY contribution
				totalWeightedAPY += assetBorrowAPY * usdValue
			}
		})

		// Calculate final weighted APY - only if we have borrows
		const finalBorrowAPY = totalBorrowed > 0 ? totalWeightedAPY / totalBorrowed : 0

		// Calculate borrow power used
		const borrowLimit = calculateBorrowLimit()
		const borrowPowerUsed = borrowLimit > 0 ? (totalBorrowed / borrowLimit) * 100 : 0

		console.log('Borrow Summary:', {
			totalBorrowed,
			totalWeightedAPY,
			finalBorrowAPY,
			borrowPowerUsed,
			borrowLimit,
			rawBalances: balances.map(b => ({
				address: b.address,
				borrowBalance: b.borrowBalance,
			})),
		})

		return {
			totalBorrowed,
			borrowAPY: finalBorrowAPY,
			borrowPowerUsed,
		}
	}

	const calculateBorrowLimit = () => {
		if (!balances || !market || !marketTotals) return 0

		let totalBorrowLimit = 0

		// Calculate total borrow limit from all supplied assets
		getSupplies.forEach(supply => {
			if (!supply.asset || !supply.usdValue) return

			// Get collateral factor for this asset
			const assetAddress = supply.asset.ctokenAddress[chainId]?.toLowerCase()
			if (!assetAddress) return

			// Get collateral factor from our hook (as decimal)
			const collateralFactor = collateralFactors[assetAddress]
			if (!collateralFactor) return

			// Convert collateral factor from string to number
			const collateralFactorNum = Number(collateralFactor)

			// Add to total borrow limit
			totalBorrowLimit += supply.usdValue * collateralFactorNum
		})

		return totalBorrowLimit
	}

	const calculateBorrowPowerUsed = () => {
		// Calculate maximum borrowing limit based on supplied collateral
		const maxBorrowLimit = calculateBorrowLimit()
		if (maxBorrowLimit === 0) return 0

		// Calculate total borrowed value
		const totalBorrowed = balances.reduce((total, balance) => {
			const asset = market?.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			if (!asset || !balance.borrowBalance) return total

			const balanceValue = ethers.utils.formatUnits(balance.borrowBalance, asset.underlyingDecimals)
			const marketTotal = marketTotals?.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			const usdValue = Number(balanceValue) * (marketTotal?.price || 0)

			return total + usdValue
		}, 0)

		// Calculate borrow power used as a percentage
		const borrowPowerUsed = (totalBorrowed / maxBorrowLimit) * 100

		console.log('Borrow Power Used Calculation:', {
			maxBorrowLimit,
			totalBorrowed,
			borrowPowerUsed: borrowPowerUsed.toFixed(2) + '%',
		})

		return borrowPowerUsed
	}

	// Update where calculateBorrowSummary is called
	const summary = calculateBorrowSummary(balances)

	const RiskDetailsModal = () => {
		if (!isRiskDetailsOpen) return null

		return (
			<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
				<div className='bg-[#1C1F2C] rounded-lg w-full max-w-2xl'>
					<div className='p-8'>
						<div className='flex justify-between items-center mb-4'>
							<Typography variant='h1' className='font-bakbak'>
								Liquidation risk parameters
							</Typography>
							<button onClick={() => setIsRiskDetailsOpen(false)} className='text-baoWhite/60 hover:text-baoWhite'>
								<FontAwesomeIcon icon={faXmark} className='w-6 h-6' />
							</button>
						</div>

						<Typography className='text-baoWhite/60 mb-8'>
							Your health factor and loan to value determine the assurance of your collateral. To avoid liquidations you can supply more
							collateral or repay borrow positions.
							<a href='#' className='underline'>
								Learn more
							</a>
						</Typography>

						<div className='bg-[#262935] rounded-lg p-6 mb-6'>
							<div className='flex justify-between items-start mb-2'>
								<div>
									<Typography variant='lg' className='font-bakbak mb-1'>
										Health factor
									</Typography>
									<Typography className='text-baoWhite/60'>
										Safety of your deposited collateral against the borrowed assets and its underlying value.
									</Typography>
								</div>
								<div className='bg-green-500 rounded-full p-4 text-xl font-bakbak'>calculateHealthFactor()</div>
							</div>

							<div className='relative h-2 bg-baoWhite/10 rounded-full mt-8 mb-2'>
								<div className='absolute left-0 h-full w-1/3 bg-red-500 rounded-l-full' />
								<div className='absolute left-1/3 h-full w-1/3 bg-yellow-500' />
								<div className='absolute left-2/3 h-full w-1/3 bg-green-500 rounded-r-full' />
								<div
									className='absolute w-4 h-4 bg-white rounded-full -mt-1 transform -translate-x-1/2'
									style={{ left: `${Math.min(Math.max((calculateHealthFactor() / 4) * 100, 0), 100)}%` }}
								/>
							</div>
							<div className='flex justify-between text-sm'>
								<div className='text-red-500'>
									1.00
									<br />
									Liquidation
									<br />
									value
								</div>
								<div className='text-green-500 text-right'>calculateHealthFactor()</div>
							</div>
							<Typography className='text-baoWhite/60 mt-4'>
								If the health factor goes below 1, the liquidation of your collateral might be triggered.
							</Typography>
						</div>

						<div className='bg-[#262935] rounded-lg p-6'>
							<div className='flex justify-between items-start mb-2'>
								<div>
									<Typography variant='lg' className='font-bakbak mb-1'>
										Current LTV
									</Typography>
									<Typography className='text-baoWhite/60'>Your current loan to value based on your collateral supplied.</Typography>
								</div>
								<div className='bg-green-500 rounded-full p-4 text-xl font-bakbak'>22.85%</div>
							</div>

							<div className='relative h-2 bg-baoWhite/10 rounded-full mt-8 mb-2'>
								<div className='absolute left-0 h-full w-1/3 bg-green-500' />
								<div className='absolute left-1/3 h-full w-1/3 bg-baoWhite/20 border-l border-dashed border-white/20' />
								<div className='absolute w-4 h-4 bg-white rounded-full -mt-1 transform -translate-x-1/2' style={{ left: '22.85%' }} />
							</div>
							<div className='flex justify-between text-sm'>
								<div className='text-green-500'>22.85%</div>
								<div className='text-baoWhite/60'>MAX 68.00%</div>
								<div className='text-red-500'>
									73.00%
									<br />
									Liquidation
									<br />
									threshold
								</div>
							</div>
							<Typography className='text-baoWhite/60 mt-4'>
								If your loan to value goes above the liquidation threshold your collateral supplied may be liquidated.
							</Typography>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Add these helper functions at the top of the file
	const getUnderlyingTokenAddress = (asset: any, chainId: number): string => {
		return asset.underlyingAddress?.[chainId]?.toLowerCase() || ''
	}

	const formatTokenBalance = (balance: any, decimals: number): string => {
		try {
			if (!balance) return '0'

			// Handle different balance formats
			let rawBalance: string
			if (typeof balance === 'string') {
				rawBalance = balance
			} else if (typeof balance === 'number') {
				rawBalance = balance.toString()
			} else if (balance._hex) {
				rawBalance = balance._hex
			} else if (balance.hex) {
				rawBalance = balance.hex
			} else if (balance.toString && typeof balance.toString === 'function') {
				rawBalance = balance.toString()
			} else {
				console.warn('Unknown balance format:', balance)
				return '0'
			}

			return ethers.utils.formatUnits(rawBalance, decimals)
		} catch (error) {
			console.error('Error formatting token balance:', error)
			return '0'
		}
	}

	// Replace the wallet balance section with this new implementation
	const WalletBalances: React.FC<{
		market: any
		chainId: number
	}> = ({ market, chainId }) => {
		const { walletBalances, isLoading } = useWalletBalances(market.name)
		const [formattedBalances, setFormattedBalances] = useState<
			Record<
				string,
				{
					balance: string
					usdValue: number
				}
			>
		>({})

		useEffect(() => {
			if (!walletBalances || !market.assets) return

			const newBalances: Record<string, { balance: string; usdValue: number }> = {}

			market.assets.forEach((asset: any) => {
				const tokenAddress = getUnderlyingTokenAddress(asset, chainId)
				if (!tokenAddress) return

				const balanceData = walletBalances[tokenAddress.toLowerCase()]
				if (!balanceData?.balance) return

				const formattedBalance = formatTokenBalance(balanceData.balance, balanceData.decimals || 18)
				const price = asset.price || 0
				const usdValue = parseFloat(formattedBalance) * price

				newBalances[asset.name] = {
					balance: formattedBalance,
					usdValue,
				}

				console.log('Processed balance:', {
					asset: asset.name,
					tokenAddress,
					rawBalance: balanceData.balance,
					formattedBalance,
					price,
					usdValue,
				})
			})

			setFormattedBalances(newBalances)
		}, [walletBalances, market.assets, chainId])

		if (isLoading) return <div>Loading wallet balances...</div>

		return (
			<div>
				{market.assets.map((asset: any) => {
					const balance = formattedBalances[asset.name]
					if (!balance) return null

					return (
						<div key={asset.name} className='flex justify-between p-2'>
							<div>{asset.name}</div>
							<div>
								{balance.balance} ({formatUSD(balance.usdValue)})
							</div>
						</div>
					)
				})}
			</div>
		)
	}

	// Update handleSupplyClick to use retry
	const handleSupplyClick = async (asset: VaultAsset | ExtendedVaultAsset) => {
		console.log('handleSupplyClick called', { asset })
		if (!chainId) return
		try {
			const result = await withRetry(async () => {
				const balance = walletBalances?.[asset.underlyingAddress[chainId]?.toLowerCase()]
				if (!balance) throw new Error('No wallet balance found')
				return { balance, marketTotal: marketTotals?.find(mt => mt.asset.ctokenAddress[chainId] === asset.ctokenAddress[chainId]) }
			})

			console.log('handleSupplyClick result', { result })
			setSelectedAsset({
				...asset,
				address: asset.ctokenAddress[chainId],
				balance: result.balance.balance || '0',
				supplyAPY: result.marketTotal?.supplyAPY || 0,
			})
			handleModalOpen('supply', {
				...asset,
				address: asset.ctokenAddress[chainId],
				balance: result.balance.balance || '0',
				supplyAPY: result.marketTotal?.supplyAPY || 0,
			})
		} catch (error) {
			console.error('Error in handleSupplyClick:', error)
		}
	}

	// Add this utility function at the top of the file
	const formatBalanceWithDecimals = (balance: string | undefined, decimals: number): string => {
		if (!balance) return '0'
		try {
			// Try to parse as BigNumber first
			const bn = ethers.BigNumber.from(balance)
			return ethers.utils.formatUnits(bn, decimals)
		} catch {
			// If it fails, return the balance as is (assuming it's already formatted)
			return balance
		}
	}

	type WithdrawModalProps = {
		isOpen: boolean
		onClose: () => void
		asset: SelectedAsset | null
		onWithdraw: (amount: string) => void
	}

	// Update the WithdrawModal component to use local state
	const WithdrawModal = memo(() => {
		const [localValue, setLocalValue] = useState('')
		const inputRef = useRef<HTMLInputElement>(null)

		// Reset value and focus input when modal opens
		useEffect(() => {
			if (isWithdrawModalOpen && inputRef.current) {
				setLocalValue('')
				inputRef.current.focus()
			}
		}, [isWithdrawModalOpen])

		const handleClose = useCallback(() => {
			setLocalValue('')
			setIsWithdrawModalOpen(false)
		}, [])

		const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value.replace(/[^0-9.]/g, '')
			if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
				setLocalValue(newValue)
			}
		}, [])

		const handleMaxClick = useCallback(() => {
			if (selectedAsset?.supplyBalance) {
				setLocalValue(selectedAsset.supplyBalance)
			}
		}, [selectedAsset])

		if (!isWithdrawModalOpen || !selectedAsset) return null

		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center'>
				<div className='absolute inset-0 bg-black/50' onClick={handleClose} />
				<div className='relative bg-baoBlack rounded-xl p-6 max-w-md w-full' onClick={e => e.stopPropagation()}>
					<div className='flex justify-between items-center mb-6'>
						<Typography variant='h1' className='font-bakbak'>
							Withdraw {selectedAsset.name}
						</Typography>
						<button type='button' onClick={handleClose} className='text-baoWhite/60 hover:text-baoWhite'>
							<FontAwesomeIcon icon={faXmark} className='w-6 h-6' />
						</button>
					</div>

					<div className='space-y-4'>
						<div className='relative'>
							<input
								ref={inputRef}
								type='text'
								inputMode='decimal'
								value={localValue}
								onChange={handleInputChange}
								className='w-full bg-transparent border border-baoWhite/10 rounded-lg p-3 text-baoWhite focus:outline-none focus:border-baoRed'
								placeholder='0.0'
								autoComplete='off'
							/>
							<button
								type='button'
								onClick={handleMaxClick}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-baoRed text-sm hover:text-baoRed/80'
							>
								MAX
							</button>
						</div>

						<div className='flex justify-between items-center'>
							<Typography variant='sm' className='text-baoWhite/60'>
								Available
							</Typography>
							<div className='flex items-center space-x-2'>
								<Typography variant='sm' className='text-baoWhite/60'>
									{formatTokenAmount(selectedAsset.supplyBalance || '0')} {selectedAsset.symbol}
								</Typography>
							</div>
						</div>
					</div>

					<button
						type='button'
						disabled={!localValue || localValue === '0'}
						onClick={() => {
							if (localValue && localValue !== '0') {
								// Handle withdraw here
								console.log('Withdrawing:', localValue)
								handleClose()
							}
						}}
						className='w-full mt-6 py-3 bg-baoRed hover:bg-baoRed/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						Withdraw
					</button>
				</div>
			</div>
		)
	})

	// Add these state declarations at the top of the PositionsPage component
	const [supplyAmount, setSupplyAmount] = useState('')
	const [repayAmount, setRepayAmount] = useState('')
	const [borrowAmount, setBorrowAmount] = useState('')
	const [needsApproval, setNeedsApproval] = useState(false)

	// Add these utility functions at the top of the file
	const isValidNumber = (value: string): boolean => {
		if (value === '') return true
		// Allow numbers with up to 18 decimals
		const regex = /^\d*\.?\d{0,18}$/
		return regex.test(value) && !isNaN(Number(value))
	}

	const formatInputValue = (value: string): string => {
		// Remove any non-numeric characters except decimal point
		const cleaned = value.replace(/[^\d.]/g, '')
		// Ensure only one decimal point
		const parts = cleaned.split('.')
		if (parts.length > 2) return parts[0] + '.' + parts[1]
		return cleaned
	}

	// Add these memoized values at the top of the PositionsPage component
	const memoizedNetWorth = useMemo(() => calculateNetWorth(), [balances, marketTotals, chainId])
	const memoizedNetAPY = useMemo(() => calculateNetAPY(), [balances, supplyRates, chainId])
	const memoizedHealthFactor = useMemo(() => calculateHealthFactor(), [balances, collateralFactors, chainId])
	const memoizedBorrowSummary = useMemo(() => calculateBorrowSummary(balances), [balances, marketTotals, chainId])
	const memoizedAssetSummary = useMemo(() => calculateAssetSummary(), [getSupplies, supplyRates, chainId])

	// Add this interface at the top with other interfaces
	interface InputState {
		value: string
		error: string
	}

	// Add these reducers near the top of the file
	const inputReducer = (state: InputState, action: { type: string; payload?: string }): InputState => {
		switch (action.type) {
			case 'SET_VALUE':
				return { ...state, value: action.payload || '' }
			case 'SET_ERROR':
				return { ...state, error: action.payload || '' }
			case 'RESET':
				return { value: '', error: '' }
			default:
				return state
		}
	}

	// Update the modal components to use reducers
	const SupplyModal = memo(() => {
		const [inputState, dispatch] = useReducer(inputReducer, { value: '', error: '' })
		const inputRef = useRef<HTMLInputElement>(null)
		const debounceTimeout = useRef<NodeJS.Timeout>()

		// Reset state when modal opens
		useEffect(() => {
			if (isSupplyModalOpen && inputRef.current) {
				dispatch({ type: 'RESET' })
				inputRef.current.focus()
			}
			return () => {
				if (debounceTimeout.current) {
					clearTimeout(debounceTimeout.current)
				}
			}
		}, [isSupplyModalOpen])

		const handleClose = useCallback(() => {
			dispatch({ type: 'RESET' })
			setIsSupplyModalOpen(false)
		}, [])

		const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value
			if (value === '' || /^\d*\.?\d*$/.test(value)) {
				dispatch({ type: 'SET_VALUE', payload: value })

				// Debounce validation
				if (debounceTimeout.current) {
					clearTimeout(debounceTimeout.current)
				}
				debounceTimeout.current = setTimeout(() => {
					// Validate input here if needed
					if (value && !isValidNumber(value)) {
						dispatch({ type: 'SET_ERROR', payload: 'Invalid number' })
					} else {
						dispatch({ type: 'SET_ERROR', payload: '' })
					}
				}, 300)
			}
		}, [])

		const handleMaxClick = useCallback(() => {
			if (selectedAsset?.balance) {
				dispatch({ type: 'SET_VALUE', payload: selectedAsset.balance })
			}
		}, [selectedAsset])

		if (!isSupplyModalOpen || !selectedAsset) return null

		return (
			<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
				<div
					className='bg-baoBlack/90 backdrop-blur-sm border border-baoWhite/10 rounded-lg w-full max-w-md'
					onClick={e => e.stopPropagation()}
				>
					<div className='p-6'>
						<div className='flex justify-between items-center mb-6'>
							<Typography variant='h1' className='font-bakbak'>
								Supply {selectedAsset?.name}
							</Typography>
							<button onClick={handleClose} className='text-baoWhite/60 hover:text-baoWhite'>
								<FontAwesomeIcon icon={faXmark} className='w-6 h-6' />
							</button>
						</div>

						<div className='mb-6'>
							<Typography variant='sm' className='text-baoWhite/60 mb-2'>
								Amount
							</Typography>
							<div className='bg-baoRed/5 border border-baoRed/20 rounded-lg p-4'>
								<div className='relative flex items-center'>
									{!inputState.value && (
										<span className='absolute inset-0 flex items-center text-2xl text-baoBlack/40 pointer-events-none select-none px-4'>
											0.0
										</span>
									)}
									<input
										ref={inputRef}
										type='text'
										inputMode='decimal'
										value={inputState.value}
										onChange={handleInputChange}
										className='bg-transparent w-full text-2xl outline-none text-baoWhite placeholder-baoWhite/40 px-4'
										autoComplete='off'
										autoCorrect='off'
										spellCheck='false'
									/>
								</div>
								<div className='flex justify-between items-center mt-2'>
									<Typography variant='sm' className='text-baoWhite/60'>
										$0
									</Typography>
									<div className='flex items-center space-x-2'>
										<Typography variant='sm' className='text-baoWhite/60'>
											Wallet balance {formatTokenAmount(selectedAsset?.balance)}
										</Typography>
										<button onClick={handleMaxClick} type='button' className='text-baoRed text-sm hover:text-baoRed/80 transition-colors'>
											MAX
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className='bg-baoBlack/40 rounded-lg p-4 mb-6'>
							<div className='flex justify-between mb-2'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Supply vAPR
								</Typography>
								<SupplyVAPR supply={getSupplies[0]} />
							</div>
							<div className='flex justify-between mb-2'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Health factor
								</Typography>
								<Typography className='text-green-500'>{calculateHealthFactor()}</Typography>
							</div>
							<div className='flex justify-between'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Gas estimate
								</Typography>
								<div className='flex items-center space-x-1'>
									<FontAwesomeIcon icon={faXmark} className='w-3 h-3 text-baoWhite/60' />
									<Typography>~$5.00</Typography>
								</div>
							</div>
						</div>

						<button
							className='w-full py-3 bg-baoRed hover:bg-baoRed/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
							onClick={() => handleModalAction(selectedAsset as ExtendedVaultAsset, true)}
							disabled={!inputState.value}
						>
							{getModalButtonText(inputState.value, true, 'Supply')}
						</button>
						{inputState.error && (
							<Typography variant='sm' className='text-baoRed mt-1'>
								{inputState.error}
							</Typography>
						)}
					</div>
				</div>
			</div>
		)
	})

	// Update the RepayModal component's input handling
	const RepayModal = () => {
		if (!isRepayModalOpen || !selectedAsset) return null
		const inputRef = useRef<HTMLInputElement>(null)

		useEffect(() => {
			if (isRepayModalOpen && inputRef.current) {
				inputRef.current.focus()
			}
		}, [isRepayModalOpen])

		const handleMaxClick = useCallback(() => {
			if (selectedAsset?.balance) {
				const formattedValue = formatInputValue(selectedAsset.balance)
				setRepayAmount(formattedValue)
			}
		}, [selectedAsset])

		const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			const value = formatInputValue(e.target.value)
			if (isValidNumber(value)) {
				setRepayAmount(value)
			}
		}, [])

		const handleClose = useCallback(() => {
			setIsRepayModalOpen(false)
			setRepayAmount('')
		}, [])

		return (
			<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
				<div className='bg-baoBlack/90 backdrop-blur-sm border border-baoWhite/10 rounded-lg w-full max-w-md'>
					<div className='p-6'>
						<div className='flex justify-between items-center mb-6'>
							<Typography variant='h1' className='font-bakbak'>
								Repay {selectedAsset?.name}
							</Typography>
							<button onClick={handleClose} className='text-baoWhite/60 hover:text-baoWhite'>
								<FontAwesomeIcon icon={faXmark} className='w-6 h-6' />
							</button>
						</div>

						<div className='mb-6'>
							<Typography variant='sm' className='text-baoWhite/60 mb-2'>
								Amount
							</Typography>
							<div className='bg-baoRed/5 border border-baoRed/20 rounded-lg p-4'>
								<div className='relative flex items-center'>
									{!repayAmount && (
										<span className='absolute inset-0 flex items-center text-2xl text-baoBlack/40 pointer-events-none select-none px-4'>
											0.0
										</span>
									)}
									<input
										ref={inputRef}
										type='text'
										value={repayAmount}
										onChange={handleInputChange}
										className='bg-transparent w-full text-2xl outline-none text-baoBlack placeholder-baoWhite/40 px-4'
										autoComplete='off'
										autoCorrect='off'
										spellCheck='false'
									/>
								</div>
								<div className='flex justify-between items-center mt-2'>
									<Typography variant='sm' className='text-baoWhite/60'>
										$0
									</Typography>
									<div className='flex items-center space-x-2'>
										<Typography variant='sm' className='text-baoWhite/60'>
											Borrowed {formatTokenAmount(selectedAsset?.balance)}
										</Typography>
										<button onClick={handleMaxClick} type='button' className='text-baoRed text-sm hover:text-baoRed/80 transition-colors'>
											MAX
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className='bg-baoBlack/40 rounded-lg p-4 mb-6'>
							<div className='flex justify-between mb-2'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Borrow vAPR
								</Typography>
								<BorrowVAPR asset={selectedAsset} />
							</div>
							<div className='flex justify-between mb-2'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Health factor
								</Typography>
								<Typography className='text-green-500'>
									{currentHF.toFixed(2)} → {newHF.toFixed(2)}
								</Typography>
							</div>
							<div className='flex justify-between'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Gas estimate
								</Typography>
								<div className='flex items-center space-x-1'>
									<FontAwesomeIcon icon={faXmark} className='w-3 h-3 text-baoWhite/60' />
									<Typography>~$5.00</Typography>
								</div>
							</div>
						</div>

						<button
							className='w-full py-3 bg-baoRed hover:bg-baoRed/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
							onClick={() => handleModalAction(selectedAsset as ExtendedVaultAsset, true)}
							disabled={!repayAmount}
						>
							{getModalButtonText(repayAmount, true, 'Repay')}
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Update the BorrowModal component's input handling
	const BorrowModal = () => {
		if (!isBorrowModalOpen || !selectedAsset) return null
		const inputRef = useRef<HTMLInputElement>(null)

		useEffect(() => {
			if (isBorrowModalOpen && inputRef.current) {
				inputRef.current.focus()
			}
		}, [isBorrowModalOpen])

		const handleMaxClick = useCallback(() => {
			if (selectedAsset?.available) {
				const formattedValue = formatInputValue(selectedAsset.available)
				setBorrowAmount(formattedValue)
			}
		}, [selectedAsset])

		const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			const value = formatInputValue(e.target.value)
			if (isValidNumber(value)) {
				setBorrowAmount(value)
			}
		}, [])

		const handleClose = useCallback(() => {
			setIsBorrowModalOpen(false)
			setBorrowAmount('')
		}, [])

		return (
			<div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
				<div className='bg-baoBlack/90 backdrop-blur-sm border border-baoWhite/10 rounded-lg w-full max-w-md'>
					<div className='p-6'>
						<div className='flex justify-between items-center mb-6'>
							<Typography variant='h1' className='font-bakbak'>
								Borrow {selectedAsset?.name}
							</Typography>
							<button onClick={handleClose} className='text-baoWhite/60 hover:text-baoWhite'>
								<FontAwesomeIcon icon={faXmark} className='w-6 h-6' />
							</button>
						</div>

						<div className='mb-6'>
							<Typography variant='sm' className='text-baoWhite/60 mb-2'>
								Amount
							</Typography>
							<div className='bg-baoRed/5 border border-baoRed/20 rounded-lg p-4'>
								<div className='relative flex items-center'>
									{!borrowAmount && (
										<span className='absolute inset-0 flex items-center text-2xl text-baoBlack/40 pointer-events-none select-none px-4'>
											0.0
										</span>
									)}
									<input
										ref={inputRef}
										type='text'
										value={borrowAmount}
										onChange={handleInputChange}
										className='bg-transparent w-full text-2xl outline-none text-baoBlack placeholder-baoWhite/40 px-4'
										autoComplete='off'
										autoCorrect='off'
										spellCheck='false'
									/>
								</div>
								<div className='flex justify-between items-center mt-2'>
									<Typography variant='sm' className='text-baoWhite/60'>
										$0
									</Typography>
									<div className='flex items-center space-x-2'>
										<Typography variant='sm' className='text-baoWhite/60'>
											Available {formatTokenAmount(selectedAsset?.available)}
										</Typography>
										<button onClick={handleMaxClick} type='button' className='text-baoRed text-sm hover:text-baoRed/80 transition-colors'>
											MAX
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className='bg-baoBlack/40 rounded-lg p-4 mb-6'>
							<div className='flex justify-between mb-2'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Borrow vAPR
								</Typography>
								<BorrowVAPR asset={selectedAsset} />
							</div>
							<div className='flex justify-between mb-2'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Health factor
								</Typography>
								<Typography className='text-green-500'>
									{currentHF.toFixed(2)} → {newHF.toFixed(2)}
								</Typography>
							</div>
							<div className='flex justify-between'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Gas estimate
								</Typography>
								<div className='flex items-center space-x-1'>
									<FontAwesomeIcon icon={faXmark} className='w-3 h-3 text-baoWhite/60' />
									<Typography>~$5.00</Typography>
								</div>
							</div>
						</div>

						<button
							className='w-full py-3 bg-baoRed hover:bg-baoRed/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
							onClick={() => handleModalAction(selectedAsset as ExtendedVaultAsset, true)}
							disabled={!borrowAmount}
						>
							{getModalButtonText(borrowAmount, true, 'Borrow')}
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Update the APY display to show both lending and underlying APY
	const SupplyVAPR = ({ supply }: { supply: ExtendedBalance }) => {
		const { chainId } = useWeb3React()

		if (!chainId || !supply?.asset?.ctokenAddress?.[chainId]) return <span>-</span>

		const rate = supplyRates[supply.asset.ctokenAddress[chainId]]
		if (!rate) return <span>-</span>

		return (
			<Tooltipped
				content={
					<div className='text-sm space-y-1'>
						<div className='font-medium mb-1'>APY Breakdown</div>
						<div className='flex justify-between gap-4'>
							<span className='text-baoWhite/60'>Lending APY:</span>
							<span>{formatPercent(Number(rate.lendingApy))}</span>
						</div>
						<div className='flex justify-between gap-4'>
							<span className='text-baoWhite/60'>Underlying APY:</span>
							<span>{formatPercent(Number(rate.underlyingApy))}</span>
						</div>
						<div className='border-t border-baoWhite/10 mt-1 pt-1 flex justify-between gap-4 font-medium'>
							<span>Total APY:</span>
							<span>{formatPercent(Number(rate.totalApy))}</span>
						</div>
					</div>
				}
				placement='right'
				className='min-w-[200px]'
			>
				<span>{formatPercent(Number(rate.totalApy))}</span>
			</Tooltipped>
		)
	}

	// Update the BorrowVAPR component to handle edge cases
	const BorrowVAPR: React.FC<{
		asset: { address: string; ctokenAddress?: Record<number, string>; underlyingAddress?: Record<number, string> }
	}> = ({ asset }) => {
		const { chainId } = useWeb3React()
		const { market: marketName } = useRouter().query
		const borrowApys = useBorrowApy(marketName as string)

		if (!chainId || !asset?.underlyingAddress?.[chainId]) return <span>-</span>

		const borrowRate = borrowApys[asset.underlyingAddress[chainId]]
		// Only show rate if it's a valid number
		if (typeof borrowRate !== 'number' || isNaN(borrowRate)) return <span>-</span>

		const displayRate = -Math.abs(borrowRate)

		return (
			<Tooltipped
				content={
					<div className='text-sm space-y-1'>
						<div className='font-medium mb-1'>Borrow Rate</div>
						<div className='flex justify-between gap-4'>
							<span className='text-baoWhite/60'>Variable APY:</span>
							<span className='text-baoRed'>{formatPercent(displayRate)}</span>
						</div>
					</div>
				}
				placement='right'
				className='min-w-[200px]'
			>
				<span className='text-baoRed'>{formatPercent(displayRate)}</span>
			</Tooltipped>
		)
	}

	// Get rates for all market assets, not just supplied ones
	const allMarketAddresses = useMemo(() => {
		if (!market) return []
		return market.assets.map(asset => ({
			ctokenAddress: asset.ctokenAddress,
			llamaId: asset.llamaId,
		}))
	}, [market])

	// Get rates for all assets in the market
	const allSupplyRates = useSupplyRates(allMarketAddresses, marketName as string)
	const allBorrowRates = useBorrowApy(marketName as string)

	// Get wallet balances for all assets
	const allWalletBalances = walletBalances as WalletBalances

	// Debug log wallet balances
	console.debug('All wallet balances:', {
		allWalletBalances,
		keys: allWalletBalances ? Object.keys(allWalletBalances) : [],
	})

	// Use these for the Assets to Supply/Borrow sections
	const getAssetSupplyRate = (asset: any) => {
		if (!chainId || !asset?.ctokenAddress?.[chainId]) return null
		return allSupplyRates[asset.ctokenAddress[chainId]]
	}

	const getAssetBorrowRate = (asset: any) => {
		if (!chainId || !asset?.underlyingAddress?.[chainId]) return null
		return allBorrowRates[asset.underlyingAddress[chainId]] || 0
	}

	// Use these for the Assets to Supply section
	const getWalletBalance = (asset: any) => {
		if (!chainId || !asset?.underlyingAddress?.[chainId]) return null

		const assetAddress = asset.underlyingAddress[chainId]
		console.log('Getting wallet balance for', asset.name, ':', {
			assetAddress,
			rawBalances: allWalletBalances,
		})

		// Handle ETH specially
		if (assetAddress.toLowerCase() === 'eth') {
			const ethBalance = allWalletBalances?.eth?.balance
			if (!ethBalance) {
				console.debug('No ETH balance found')
				return null
			}

			const marketTotal = marketTotals?.find(
				total => total.asset.ctokenAddress[chainId]?.toLowerCase() === asset.ctokenAddress[chainId]?.toLowerCase(),
			)

			try {
				// ETH balance is already a BigNumber
				const amount = Number(ethers.utils.formatUnits(ethBalance, 18))
				const usdValue = amount * (marketTotal?.price || 0)
				return { amount, usdValue }
			} catch (error) {
				console.error('Error formatting ETH balance:', error, ethBalance)
				return null
			}
		}

		// Handle other tokens
		const balanceData = allWalletBalances?.[assetAddress.toLowerCase()]
		if (!balanceData) {
			console.debug('No balance found for token:', {
				asset: asset.name,
				address: assetAddress,
			})
			return null
		}

		const marketTotal = marketTotals?.find(
			total => total.asset.ctokenAddress[chainId]?.toLowerCase() === asset.ctokenAddress[chainId]?.toLowerCase(),
		)

		try {
			// Balance should be a BigNumber instance
			if (!balanceData.balance || !ethers.BigNumber.isBigNumber(balanceData.balance)) {
				console.error('Invalid balance format:', {
					balance: balanceData.balance,
					type: typeof balanceData.balance,
				})
				return null
			}

			const amount = Number(ethers.utils.formatUnits(balanceData.balance, balanceData.decimals))
			const usdValue = amount * (marketTotal?.price || 0)
			return { amount, usdValue }
		} catch (error) {
			console.error('Error formatting token balance:', error, {
				balanceData,
				decimals: balanceData.decimals,
				balanceType: typeof balanceData.balance,
			})
			return null
		}
	}

	// Create a state for borrow amounts
	const [borrowAmounts, setBorrowAmounts] = useState<{ [key: string]: string }>({})

	// Handler for borrow amount updates
	const handleBorrowUpdate = useCallback((address: string, amount: string) => {
		setBorrowAmounts(prev => ({
			...prev,
			[address.toLowerCase()]: amount,
		}))
	}, [])

	// Use borrowAmounts instead of assetBorrows in the rest of the code
	const calculateAvailableToBorrow = (asset: any, marketTotal: any) => {
		if (!marketTotal || !asset || !chainId) {
			console.log('Cannot calculate available to borrow:', {
				hasMarketTotal: !!marketTotal,
				hasAsset: !!asset,
				hasChainId: !!chainId,
				assetName: asset?.name,
			})
			return 0
		}

		// Get total supply and total borrow from marketTotal
		const totalSupply = marketTotal.supply || 0
		const totalBorrow = marketTotal.borrow || 0

		// Log raw values from marketTotal for debugging
		console.log('Market Total Raw Values:', {
			asset: asset.name,
			marketTotal,
			totalSupplyRaw: marketTotal.supply,
			totalBorrowRaw: marketTotal.borrow,
			totalSupplyFormatted: totalSupply,
			totalBorrowFormatted: totalBorrow,
		})

		// Available = Total Supply - Total Market Borrows
		const available = Math.max(totalSupply - totalBorrow, 0)

		console.log('Available to borrow calculation:', {
			asset: asset.name,
			totalSupply: totalSupply.toFixed(4),
			totalBorrow: totalBorrow.toFixed(4),
			available: available.toFixed(4),
			marketTotalDetails: {
				price: marketTotal.price,
				availableUSD: (available * marketTotal.price).toFixed(2),
			},
		})

		return available
	}

	// Calculate portfolio composition percentages
	const getPortfolioComposition = () => {
		const totalSupplyUSD = getSupplies.reduce((sum, supply) => sum + (supply.usdValue || 0), 0)
		const totalBorrowUSD =
			balances?.reduce((sum, balance) => {
				const asset = market?.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
				if (!asset || !balance.borrowBalance) return sum
				const balanceValue = ethers.utils.formatUnits(balance.borrowBalance, asset.underlyingDecimals)
				const marketTotal = marketTotals?.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
				return sum + Number(balanceValue) * (marketTotal?.price || 0)
			}, 0) || 0

		return {
			supplyPercentage: totalSupplyUSD ? ((totalSupplyUSD / (totalSupplyUSD + totalBorrowUSD)) * 100).toFixed(2) : '0',
			borrowPercentage: totalBorrowUSD ? ((totalBorrowUSD / (totalSupplyUSD + totalBorrowUSD)) * 100).toFixed(2) : '0',
		}
	}

	// Calculate projected earnings based on current positions
	const getProjectedEarnings = () => {
		const netWorth = calculateNetWorth()
		const netAPY = calculateNetAPY()
		return {
			daily: ((netWorth * (netAPY / 100)) / 365).toFixed(2),
			monthly: ((netWorth * (netAPY / 100)) / 12).toFixed(2),
			yearly: (netWorth * (netAPY / 100)).toFixed(2),
		}
	}

	// Calculate weighted APYs and totals for the portfolio
	const { totalSupplyUSD, totalBorrowUSD, weightedSupplyAPY, weightedBorrowAPY } = useMemo(() => {
		if (!balances || !market || !marketTotals) {
			return {
				totalSupplyUSD: 0,
				totalBorrowUSD: 0,
				weightedSupplyAPY: 0,
				weightedBorrowAPY: 0,
			}
		}

		let _totalSupplyUSD = 0
		let _totalBorrowUSD = 0
		let _weightedSupplyAPY = 0
		let _weightedBorrowAPY = 0

		// Calculate supply totals
		getSupplies.forEach(supply => {
			if (!supply.asset || !supply.usdValue) return
			_totalSupplyUSD += supply.usdValue

			// Get supply APY for this asset
			const rate = supplyRates[supply.asset.ctokenAddress[chainId]]
			if (rate) {
				const supplyAPY = Number(rate.totalApy)
				_weightedSupplyAPY += supplyAPY * supply.usdValue
			}
		})

		// Calculate borrow totals
		balances.forEach(balance => {
			const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			if (!asset || !balance.borrowBalance) return

			const balanceValue = ethers.utils.formatUnits(balance.borrowBalance, asset.underlyingDecimals)
			const marketTotal = marketTotals.find(total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balance.address.toLowerCase())
			const usdValue = Number(balanceValue) * (marketTotal?.price || 0)
			_totalBorrowUSD += usdValue

			// Get borrow APY for this asset
			const borrowAPY = borrowApys[asset.underlyingAddress[chainId]] || 0
			_weightedBorrowAPY += Math.abs(borrowAPY) * usdValue
		})

		return {
			totalSupplyUSD: _totalSupplyUSD,
			totalBorrowUSD: _totalBorrowUSD,
			weightedSupplyAPY: _weightedSupplyAPY,
			weightedBorrowAPY: _weightedBorrowAPY,
		}
	}, [balances, market, marketTotals, chainId, getSupplies, supplyRates, borrowApys])

	// Add a debug log for market totals
	useEffect(() => {
		if (marketTotals) {
			console.log(
				'Market Totals Debug:',
				marketTotals.map(total => ({
					asset: total.asset.name,
					supply: total.supply,
					borrow: total.borrow,
					price: total.price,
					supplyAPY: total.supplyAPY,
					borrowAPY: total.borrowAPY,
				})),
			)
		}
	}, [marketTotals])

	const [currentHF, setCurrentHF] = useState(0)
	const [newHF, setNewHF] = useState(0)

	const getModalButtonText = (
		amount: string | undefined,
		needsApproval: boolean,
		action: 'Supply' | 'Withdraw' | 'Borrow' | 'Repay',
	): string => {
		if (!amount) return 'Enter an amount'
		if (needsApproval) return 'Approve'
		return action
	}

	// Update the handleApprove function
	const handleApprove = async (
		asset: ExtendedVaultAsset,
		chainId: number | undefined,
		library: Web3Provider | undefined,
		account: string | undefined | null,
	): Promise<void> => {
		if (!chainId || !library || !account) return
		try {
			const signer = library.getSigner()
			const tokenContract = new Contract(
				asset.underlyingAddress[chainId],
				['function approve(address spender, uint256 amount) returns (bool)'],
				signer,
			)
			const tx = await tokenContract.approve(asset.ctokenAddress[chainId], ethers.constants.MaxUint256)
			await tx.wait()
		} catch (error) {
			console.error('Error approving token:', error)
			throw error
		}
	}

	// Update the handleModalAction function
	const handleModalAction = async (asset: ExtendedVaultAsset, isApproval: boolean) => {
		if (isApproval) {
			try {
				await handleApprove(asset, chainId, library, account)
			} catch (error) {
				console.error('Error in approval:', error)
			}
		} else {
			await handleSupplyClick(asset)
		}
	}

	const mapBalanceToExtended = (balance: any, asset: ExtendedVaultAsset, marketTotal: MarketTotal | undefined): ExtendedBalance => {
		const balanceValue = formatBalance(balance.balance, balance.exchangeRate, balance.decimals, false)
		const usdValue = balanceValue * (marketTotal?.price || 0)

		return {
			...balance,
			balanceValue,
			usdValue,
			asset,
			symbol: asset.symbol,
			balanceUSD: usdValue,
			supplyBalance: balance.supplyBalance || '0',
			borrowBalance: balance.borrowBalance || '0',
		}
	}

	// Update the type predicate function
	const isValidAssetWithLlamaId = (item: any): item is { ctokenAddress: Record<number, string>; llamaId?: string } => {
		return (
			item !== null &&
			typeof item === 'object' &&
			item.ctokenAddress &&
			typeof item.ctokenAddress === 'object' &&
			(item.llamaId === undefined || typeof item.llamaId === 'string')
		)
	}

	// State declarations at the top of PositionsPage
	const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null)

	// Update the modal state management
	const [modalState, setModalState] = useState({
		supply: { isOpen: false, asset: null as any },
		withdraw: { isOpen: false, asset: null as any },
		borrow: { isOpen: false, asset: null as any },
		repay: { isOpen: false, asset: null as any },
	})

	// Add effect to track modal state changes
	useEffect(() => {
		console.log('Modal state changed:', modalState)
	}, [modalState])

	const handleModalOpen = useCallback((type: 'supply' | 'withdraw' | 'borrow' | 'repay', asset: any) => {
		console.log('handleModalOpen called', { type, asset })
		setModalState(prev => ({
			...prev,
			[type]: { isOpen: true, asset },
		}))
	}, [])

	const handleModalClose = useCallback((type: 'supply' | 'withdraw' | 'borrow' | 'repay') => {
		console.log('handleModalClose called', { type })
		setModalState(prev => ({
			...prev,
			[type]: { isOpen: false, asset: null },
		}))
	}, [])

	// Add effect to track net worth updates
	useEffect(() => {
		console.log('Net worth calculation dependencies changed:', {
			balancesLength: balances?.length,
			marketTotalsLength: marketTotals?.length,
			chainId,
		})
	}, [balances, marketTotals, chainId])

	// Add effect to track supply rates updates
	useEffect(() => {
		console.log('Supply rates dependencies changed:', {
			ctokenAddressesLength: ctokenAddresses?.length,
			marketName,
		})
	}, [ctokenAddresses, marketName])

	// Track when handleSupplyClick is called
	useEffect(() => {
		console.log('handleSupplyClick called', { selectedAsset })
	}, [selectedAsset])

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='mb-8'>
				<div
					onClick={() => router.push('/lend')}
					className='flex items-center space-x-2 text-baoWhite/60 hover:text-baoWhite cursor-pointer'
				>
					<FontAwesomeIcon icon={faArrowLeft} className='w-4 h-4' />
					<Typography variant='sm'>Back to Markets</Typography>
				</div>
			</div>

			<div className='flex items-center justify-between mb-8'>
				<div className='flex items-center space-x-4'>
					<div className='w-16 h-16 rounded-full bg-baoBlack/60 border border-baoWhite/10 overflow-hidden'>
						<Image src={`/images/tokens/${marketName}.png`} alt={market.name} width={64} height={64} />
					</div>
					<div>
						<div className='flex items-center space-x-2'>
							<div className='relative' ref={dropdownRef}>
								<button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className='flex items-center space-x-2 hover:bg-baoBlack/40 rounded-lg px-3 py-2 transition-colors'
								>
									<Typography variant='h1' className='font-bakbak'>
										{market.name}
									</Typography>
									<FontAwesomeIcon icon={faChevronDown} className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{isDropdownOpen && (
									<div className='absolute z-10 mt-2 w-56 rounded-lg bg-baoBlack border border-gray-800 shadow-lg'>
										<div className='py-1'>
											{Object.entries(Config.vaults).map(([name, marketData]) => (
												<button
													key={name}
													onClick={() => handleMarketChange(name)}
													className={`w-full px-4 py-2 text-left hover:bg-baoRed/10 flex items-center space-x-2 ${
														name === marketName ? 'bg-baoRed/20' : ''
													}`}
												>
													<Image src={`/images/tokens/${name}.png`} alt={marketData.name} width={24} height={24} className='rounded-full' />
													<span>{marketData.name}</span>
													{marketData.type === 'core market' && <span className='ml-auto text-xs bg-baoRed px-2 py-0.5 rounded'>Core</span>}
												</button>
											))}
										</div>
									</div>
								)}
							</div>
							<div
								className={`px-2 py-1 rounded text-sm ${
									market.type === 'core market' ? 'bg-baoRed text-white' : 'bg-baoBlack/60 text-baoWhite/60'
								}`}
							>
								{market.type === 'core market' ? 'Core' : 'Insured'}
							</div>
						</div>
						<Typography variant='lg' className='text-baoWhite/60'>
							{market.desc}
						</Typography>
					</div>
				</div>

				<div className='flex items-center space-x-8'>
					<div>
						<Typography variant='sm' className='text-baoWhite/60'>
							Net worth
						</Typography>
						<Tooltipped
							content={
								<div className='p-4 space-y-2'>
									<div className='flex justify-between'>
										<span>Supply Value:</span>
										<span>{formatCompactCurrency(Number(getSupplies.reduce((sum, supply) => sum + (supply.usdValue || 0), 0)))}</span>
									</div>
									<div className='flex justify-between'>
										<span>Borrow Value:</span>
										<span>-{formatCompactCurrency(Number(memoizedBorrowSummary.totalBorrowed))}</span>
									</div>
									<div className='mt-4 pt-2 border-t border-baoWhite/10'>
										<div>Portfolio Composition:</div>
										<div className='flex justify-between'>
											<span>Supply: {formatPercent(Number(getPortfolioComposition().supplyPercentage))}</span>
											<span>Borrow: {formatPercent(Number(getPortfolioComposition().borrowPercentage))}</span>
										</div>
									</div>
								</div>
							}
						>
							<Typography variant='h1' className='font-bakbak lg:text-4xl text-2xl'>
								{formatCompactCurrency(Number(memoizedNetWorth))}
							</Typography>
						</Tooltipped>
					</div>

					<div>
						<Typography variant='sm' className='text-baoWhite/60'>
							Net vAPR
						</Typography>
						<Tooltipped
							content={
								<div className='p-4 space-y-2'>
									<div className='flex justify-between'>
										<span>Supply APY:</span>
										<span className='text-green-500'>{formatPercent(weightedSupplyAPY / totalSupplyUSD || 0)}</span>
									</div>
									<div className='flex justify-between'>
										<span>Borrow APY:</span>
										<span className='text-baoRed'>{formatPercent(weightedBorrowAPY / totalBorrowUSD || 0)}</span>
									</div>
									<div className='mt-4 pt-2 border-t border-baoWhite/10'>
										<div>Projected Earnings:</div>
										<div className='space-y-1'>
											<div className='flex justify-between'>
												<span>Daily:</span>
												<span>{formatCompactCurrency(Number(getProjectedEarnings().daily))}</span>
											</div>
											<div className='flex justify-between'>
												<span>Monthly:</span>
												<span>{formatCompactCurrency(Number(getProjectedEarnings().monthly))}</span>
											</div>
											<div className='flex justify-between'>
												<span>Yearly:</span>
												<span>{formatCompactCurrency(Number(getProjectedEarnings().yearly))}</span>
											</div>
										</div>
									</div>
								</div>
							}
						>
							<Typography
								variant='h1'
								className={`font-bakbak lg:text-4xl text-2xl ${memoizedNetAPY < 0 ? 'text-baoRed' : 'text-green-500'}`}
							>
								{formatPercent(Number(memoizedNetAPY))}
							</Typography>
						</Tooltipped>
					</div>

					<div>
						<Typography variant='sm' className='text-baoWhite/60'>
							Health factor
						</Typography>
						<div className='flex items-center space-x-2'>
							<Tooltipped
								content={
									<div className='p-4 space-y-2'>
										<div className='flex justify-between'>
											<span>Current Health Factor:</span>
											<span
												className={`${
													memoizedHealthFactor <= 1 ? 'text-baoRed' : memoizedHealthFactor <= 1.25 ? 'text-yellow-500' : 'text-green-500'
												}`}
											>
												{formatNumber(memoizedHealthFactor, 2)}
											</span>
										</div>
										<div className='mt-2'>
											<div>Risk Levels:</div>
											<div className='space-y-1 mt-1'>
												<div className='flex justify-between'>
													<span className='text-baoRed'>High Risk:</span>
													<span>Below 1.0</span>
												</div>
												<div className='flex justify-between'>
													<span className='text-yellow-500'>Moderate:</span>
													<span>1.0 - 1.25</span>
												</div>
												<div className='flex justify-between'>
													<span className='text-green-500'>Safe:</span>
													<span>Above 1.25</span>
												</div>
											</div>
										</div>
										<div className='mt-4 pt-2 border-t border-baoWhite/10'>
											<div>Note:</div>
											<div className='text-sm text-baoWhite/60 mt-1'>
												If your health factor goes below 1.0, your collateral may be liquidated.
											</div>
										</div>
									</div>
								}
							>
								<Typography
									variant='h1'
									className={`font-bakbak text-4xl ${
										memoizedHealthFactor <= 1 ? 'text-baoRed' : memoizedHealthFactor <= 1.25 ? 'text-yellow-500' : 'text-green-500'
									}`}
								>
									{formatNumber(memoizedHealthFactor, 2)}
								</Typography>
							</Tooltipped>
							<button
								onClick={() => setIsRiskDetailsOpen(true)}
								className='px-3 py-1 text-xs bg-baoWhite/10 rounded hover:bg-baoWhite/20 transition-colors'
							>
								RISK DETAILS
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Tabs */}
			<div className='lg:hidden mb-8'>
				<div className='flex rounded-lg border border-gray-800 p-1'>
					<button
						onClick={() => setActiveTab('supplies')}
						className={`flex-1 py-2 px-4 rounded-md text-center transition-colors ${
							activeTab === 'supplies' ? 'bg-baoRed text-white' : 'text-baoWhite/60 hover:text-baoWhite'
						}`}
					>
						<Typography variant='sm'>Supplies</Typography>
					</button>
					<button
						onClick={() => setActiveTab('borrows')}
						className={`flex-1 py-2 px-4 rounded-md text-center transition-colors ${
							activeTab === 'borrows' ? 'bg-baoRed text-white' : 'text-baoWhite/60 hover:text-baoWhite'
						}`}
					>
						<Typography variant='sm'>Borrows</Typography>
					</button>
				</div>
			</div>

			{/* Desktop Layout */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				{/* Supplies Section */}
				<div className={`${activeTab === 'borrows' ? 'lg:block hidden' : ''}`}>
					<div className='flex justify-between items-center mb-2'>
						<Typography variant='lg' className='font-bakbak'>
							Your Supplies
						</Typography>
						<div className='flex gap-4'>
							{(() => {
								const summary = memoizedAssetSummary
								return (
									<>
										<div className='glassmorphic-card px-2 py-1 w-fit'>
											<div className='flex items-center space-x-1'>
												<Typography variant='sm' className='text-baoWhite/60'>
													Balance:
												</Typography>
												<Typography>{formatUSD(summary.totalBalance)}</Typography>
											</div>
										</div>
										<div className='glassmorphic-card px-2 py-1 w-fit'>
											<div className='flex items-center space-x-1'>
												<Typography variant='sm' className='text-baoWhite/60'>
													APY:
												</Typography>
												<Tooltipped
													content={
														<div className='text-sm'>
															<div className='font-medium'>Blended APY</div>
															<div className='text-baoWhite/60 mt-1'>Weighted average of all supplied assets</div>
														</div>
													}
													placement='right'
												>
													<span className='text-baoWhite'>{formatPercent(summary.totalAPY)}</span>
												</Tooltipped>
											</div>
										</div>
									</>
								)
							})()}
						</div>
					</div>
					<div className='glassmorphic-card p-0'>
						<div className='divide-y divide-baoWhite/10'>
							{/* Header */}
							<div className='grid grid-cols-4 gap-4 p-4'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Asset
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right'>
									Balance
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right pr-8 lg:pr-12'>
									APY
								</Typography>
								<div /> {/* Empty column for buttons */}
							</div>

							{/* Content */}
							{isLoading ? (
								<div className='p-4'>
									<Typography className='text-center text-baoWhite/60'>Loading balances...</Typography>
								</div>
							) : getSupplies.length > 0 ? (
								getSupplies.map((supply, i) => (
									<div key={i} className='grid grid-cols-4 gap-4 p-4'>
										<div className='flex items-center space-x-2'>
											<Image
												src={supply.asset?.icon || ''}
												alt={supply.asset?.name || ''}
												width={24}
												height={24}
												className='rounded-full'
											/>
											<Typography>{supply.asset?.name || supply.symbol}</Typography>
										</div>
										<div className='text-right'>
											<Typography>{formatTokenAmount(supply.balanceValue)}</Typography>
											<Typography variant='sm' className='text-baoWhite/60'>
												{formatUSD(supply.usdValue || 0)}
											</Typography>
										</div>
										<div className='text-right pr-8 lg:pr-12'>
											<SupplyVAPR supply={supply} />
										</div>
										<div className='flex justify-end space-x-2'>
											<button
												onClick={() => {
													setSelectedAsset({
														name: supply.asset?.name || supply.symbol,
														balance: formatTokenAmount(supply.balanceValue),
														address: supply.address,
														asset: supply.asset,
													})
													setIsWithdrawModalOpen(true)
												}}
												className='px-4 py-1.5 text-sm bg-baoRed rounded-lg hover:bg-baoRed/80 transition-colors leading-[1] h-[28px]'
											>
												Withdraw
											</button>
											<button className='px-4 py-1.5 text-sm bg-baoWhite/10 rounded-lg hover:bg-baoWhite/20 transition-colors leading-[1] h-[28px]'>
												Details
											</button>
										</div>
									</div>
								))
							) : (
								<div className='p-4'>
									<Typography className='text-center text-baoWhite/60'>Nothing supplied yet</Typography>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Borrows Section */}
				<div className={`${activeTab === 'supplies' ? 'lg:block hidden' : ''}`}>
					<div className='flex justify-between items-center mb-2'>
						<Typography variant='lg' className='font-bakbak'>
							Your Borrows
						</Typography>
						<div className='flex gap-4'>
							{(() => {
								const summary = memoizedBorrowSummary
								return (
									<>
										<div className='glassmorphic-card px-2 py-1 w-fit'>
											<div className='flex items-center space-x-1'>
												<Typography variant='sm' className='text-baoWhite/60'>
													Balance:
												</Typography>
												<Typography>{formatUSD(summary.totalBorrowed)}</Typography>
											</div>
										</div>
										<div className='glassmorphic-card px-2 py-1 w-fit'>
											<div className='flex items-center space-x-1'>
												<Typography variant='sm' className='text-baoWhite/60'>
													APY:
												</Typography>
												<Tooltipped
													content={
														<div className='text-sm'>
															<div className='font-medium'>Blended Borrow APY</div>
															<div className='text-baoWhite/60 mt-1'>Weighted average APY across all borrowed assets</div>
														</div>
													}
													placement='right'
												>
													<span className='text-baoRed'>{(-Math.abs(summary.borrowAPY)).toFixed(2)}%</span>
												</Tooltipped>
											</div>
										</div>
										<div className='glassmorphic-card px-2 py-1 w-fit'>
											<div className='flex items-center space-x-1'>
												<Typography variant='sm' className='text-baoWhite/60'>
													Borrow Power Used:
												</Typography>
												<Tooltipped
													content={
														<div className='text-sm'>
															<div className='font-medium'>Borrow Power Used</div>
															<div className='text-baoWhite/60 mt-1'>
																Percentage of your total borrowing capacity currently in use.
																<br />
																Calculated as: (Total Borrowed Value / Total Borrow Limit) × 100
															</div>
														</div>
													}
													placement='right'
												>
													<span className={`${calculateBorrowPowerUsed() > 80 ? 'text-baoRed' : ''}`}>
														{calculateBorrowPowerUsed().toFixed(2)}%
													</span>
												</Tooltipped>
											</div>
										</div>
									</>
								)
							})()}
						</div>
					</div>
					<div className='glassmorphic-card p-0'>
						<div className='divide-y divide-baoWhite/10'>
							{/* Header */}
							<div className='grid grid-cols-4 gap-4 p-4'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Asset
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right'>
									Balance
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right pr-8 lg:pr-12'>
									APY
								</Typography>
								<div /> {/* Empty column for buttons */}
							</div>

							{/* Content */}
							{isLoading ? (
								<div className='p-4'>
									<Typography className='text-center text-baoWhite/60'>Loading balances...</Typography>
								</div>
							) : balances.some(b => b.borrowBalance && Number(b.borrowBalance) > 0) ? (
								balances
									.filter(balanceItem => {
										console.log('Checking borrow balance:', {
											balanceAddress: balanceItem.address,
											balance: balanceItem.borrowBalance,
											exchangeRate: balanceItem.exchangeRate,
											symbol: balanceItem.symbol,
										})

										const asset = market.assets.find(
											a => a.ctokenAddress[chainId]?.toLowerCase() === balanceItem.address.toLowerCase() && a.borrow,
										)

										if (!asset?.borrow) return false

										const balanceValue = balanceItem.borrowBalance
											? ethers.utils.formatUnits(balanceItem.borrowBalance, asset.underlyingDecimals)
											: '0'

										console.log('Asset match:', {
											found: !!asset,
											assetName: asset?.name,
											formattedBalance: balanceValue,
											allowsBorrowing: asset?.borrow,
										})

										return Number(balanceValue) > 0
									})
									.map(balanceItem => {
										const asset = market.assets.find(a => a.ctokenAddress[chainId]?.toLowerCase() === balanceItem.address.toLowerCase())
										if (!asset) return null

										const balanceValue = balanceItem.borrowBalance
											? ethers.utils.formatUnits(balanceItem.borrowBalance, asset.underlyingDecimals)
											: '0'
										const marketTotal = marketTotals?.find(
											total => total.asset.ctokenAddress[chainId]?.toLowerCase() === balanceItem.address.toLowerCase(),
										)

										return (
											<div key={balanceItem.address} className='grid grid-cols-4 gap-4 p-4'>
												<div className='flex items-center space-x-2'>
													<Image src={asset.icon || ''} alt={balanceItem.symbol} width={24} height={24} className='rounded-full' />
													<Typography>{asset.name || balanceItem.symbol}</Typography>
												</div>
												<div className='text-right'>
													<Typography>{formatTokenAmount(balanceValue)}</Typography>
													<Typography variant='sm' className='text-baoWhite/60'>
														{formatUSD(Number(balanceValue) * (marketTotal?.price || 0))}
													</Typography>
												</div>
												<div className='text-right pr-8 lg:pr-12'>
													<BorrowVAPR asset={asset} />
												</div>
												<div className='flex justify-end space-x-2 pl-4'>
													<button
														onClick={() => {
															setSelectedAsset({
																name: asset.name || balanceItem.symbol,
																balance: formatTokenAmount(balanceValue),
																borrowAPY: marketTotal?.borrowAPY,
																address: asset.ctokenAddress,
																asset,
															})
															setIsRepayModalOpen(true)
														}}
														className='px-4 py-1.5 text-sm bg-baoRed rounded-lg hover:bg-baoRed/80 transition-colors leading-[1] h-[28px]'
													>
														Repay
													</button>
													<button className='px-4 py-1.5 text-sm bg-baoWhite/10 rounded-lg hover:bg-baoWhite/20 transition-colors leading-[1] h-[28px]'>
														Details
													</button>
												</div>
											</div>
										)
									})
							) : (
								<div className='p-4'>
									<Typography className='text-center text-baoWhite/60'>Nothing borrowed yet</Typography>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Asset Actions Sections */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8'>
				{/* Assets to Supply */}
				<div>
					<div className='flex justify-between items-center mb-2'>
						<Typography variant='lg' className='font-bakbak'>
							Assets to Supply
						</Typography>
					</div>
					<div className='glassmorphic-card p-0'>
						<div className='divide-y divide-baoWhite/10'>
							{/* Header */}
							<div className='grid grid-cols-5 gap-4 p-4'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Asset
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right'>
									Wallet balance
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right'>
									Max LTV
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right pr-8 lg:pr-12'>
									Supply vAPR
								</Typography>
								<div /> {/* Empty column for buttons */}
							</div>

							{/* Content */}
							{market.assets
								.filter(asset => asset.supply)
								.map(asset => {
									const walletBalance = getWalletBalance(asset)
									const rate = getAssetSupplyRate(asset)
									const maxLTV = getAssetCollateralFactor(asset)

									return (
										<div key={asset.ctokenAddress[chainId]} className='grid grid-cols-5 gap-4 p-4'>
											<div className='flex items-center space-x-2'>
												<Image src={asset.icon} alt={asset.name} width={24} height={24} className='rounded-full' />
												<Typography>{asset.name}</Typography>
											</div>
											<div className='text-right'>
												<Typography>{walletBalance ? formatTokenAmount(walletBalance.amount) : '-'}</Typography>
												<Typography variant='sm' className='text-baoWhite/60'>
													{walletBalance ? formatCompactCurrency(walletBalance.usdValue) : '$0.00'}
												</Typography>
											</div>
											<div className='text-right'>
												<Typography>{maxLTV}%</Typography>
											</div>
											<div className='text-right pr-8 lg:pr-12'>
												{rate ? (
													<Tooltipped
														content={
															<div className='text-sm space-y-1'>
																<div className='font-medium mb-1'>APR Breakdown</div>
																<div className='flex justify-between gap-4'>
																	<span className='text-baoWhite/60'>Lending APR:</span>
																	<span>{formatPercent(Number(rate.lendingApy))}</span>
																</div>
																<div className='flex justify-between gap-4'>
																	<span className='text-baoWhite/60'>Underlying APR:</span>
																	<span>{formatPercent(Number(rate.underlyingApy))}</span>
																</div>
																<div className='border-t border-baoWhite/10 mt-1 pt-1 flex justify-between gap-4 font-medium'>
																	<span>Total APR:</span>
																	<span>{formatPercent(Number(rate.totalApy))}</span>
																</div>
															</div>
														}
														placement='right'
														className='min-w-[200px]'
													>
														<span>{formatPercent(Number(rate.totalApy))}</span>
													</Tooltipped>
												) : (
													'-'
												)}
											</div>
											<div className='flex justify-end space-x-2'>
												<button
													onClick={() => handleSupplyClick(asset)}
													className='px-4 py-1.5 text-sm bg-baoRed rounded-lg hover:bg-baoRed/80 transition-colors leading-[1] h-[28px]'
												>
													Supply
												</button>
												<button className='px-4 py-1.5 text-sm bg-baoWhite/10 rounded-lg hover:bg-baoWhite/20 transition-colors leading-[1] h-[28px]'>
													Details
												</button>
											</div>
										</div>
									)
								})}
						</div>
					</div>
				</div>

				{/* Assets to Borrow */}
				<div>
					<div className='flex justify-between items-center mb-2'>
						<Typography variant='lg' className='font-bakbak'>
							Assets to Borrow
						</Typography>
					</div>
					<div className='glassmorphic-card p-0'>
						<div className='divide-y divide-baoWhite/10'>
							{/* Header */}
							<div className='grid grid-cols-4 gap-4 p-4'>
								<Typography variant='sm' className='text-baoWhite/60'>
									Asset
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right'>
									Available
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 text-right pr-8 lg:pr-12'>
									Borrow vAPR
								</Typography>
								<div /> {/* Empty column for buttons */}
							</div>

							{/* Content */}
							{market.assets
								.filter(asset => asset.borrow)
								.map(asset => {
									const marketTotal = marketTotals?.find(
										total => total.asset.ctokenAddress[chainId]?.toLowerCase() === asset.ctokenAddress[chainId]?.toLowerCase(),
									)
									const borrowRate = getAssetBorrowRate(asset)
									const displayRate = borrowRate !== null ? -Math.abs(borrowRate) : null
									const availableToBorrow = calculateAvailableToBorrow(asset, marketTotal)

									return (
										<div key={asset.ctokenAddress[chainId]} className='grid grid-cols-4 gap-4 p-4'>
											<div className='flex items-center space-x-2'>
												<Image src={asset.icon} alt={asset.name} width={24} height={24} className='rounded-full' />
												<Typography>{asset.name}</Typography>
											</div>
											<div className='text-right'>
												<Typography>{formatTokenAmount(availableToBorrow)}</Typography>
												<Typography variant='sm' className='text-baoWhite/60'>
													{formatCompactCurrency(availableToBorrow * (marketTotal?.price || 0))}
												</Typography>
											</div>
											<div className='text-right pr-8 lg:pr-12'>
												{displayRate !== null ? (
													<Tooltipped
														content={
															<div className='text-sm space-y-1'>
																<div className='font-medium mb-1'>Borrow Rate</div>
																<div className='flex justify-between gap-4'>
																	<span className='text-baoWhite/60'>Variable APR:</span>
																	<span className='text-baoRed'>{formatPercent(displayRate)}</span>
																</div>
															</div>
														}
														placement='right'
													>
														<span className='text-baoRed'>{formatPercent(displayRate)}</span>
													</Tooltipped>
												) : (
													'-'
												)}
											</div>
											<div className='flex justify-end space-x-2'>
												<button
													onClick={() => handleSupplyClick(asset)}
													className='px-4 py-1.5 text-sm bg-baoRed rounded-lg hover:bg-baoRed/80 transition-colors leading-[1] h-[28px]'
												>
													Borrow
												</button>
												<button className='px-4 py-1.5 text-sm bg-baoWhite/10 rounded-lg hover:bg-baoWhite/20 transition-colors leading-[1] h-[28px]'>
													Details
												</button>
											</div>
										</div>
									)
								})}
						</div>
					</div>
				</div>
			</div>

			<RiskDetailsModal />
			<SupplyModal isOpen={modalState.supply.isOpen} onClose={() => handleModalClose('supply')} asset={modalState.supply.asset} />

			<WithdrawModal isOpen={modalState.withdraw.isOpen} onClose={() => handleModalClose('withdraw')} asset={modalState.withdraw.asset} />

			<BorrowModal isOpen={modalState.borrow.isOpen} onClose={() => handleModalClose('borrow')} asset={modalState.borrow.asset} />

			<RepayModal isOpen={modalState.repay.isOpen} onClose={() => handleModalClose('repay')} asset={modalState.repay.asset} />

			{/* Add AssetBorrowAmount components for each asset */}
			{market?.assets?.map(asset => (
				<AssetBorrowAmount
					key={asset.ctokenAddress[chainId]}
					marketName={marketName as string}
					ctokenAddress={asset.ctokenAddress}
					onBorrowUpdate={amount => handleBorrowUpdate(asset.ctokenAddress[chainId], amount)}
				/>
			))}
		</div>
	)
}

export default PositionsPage
