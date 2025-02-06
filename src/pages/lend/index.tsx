import { FC, useState, useMemo } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { useWeb3React } from '@web3-react/core'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'
import { useMarketTotals } from '@/hooks/lend/useMarketTotals'
import { Tooltip } from '@/components/Tooltip'
import Loader from '@/components/Loader'
import { useEffect } from 'react'
import { Balance } from '@/bao/lib/types'
import Config from '@/bao/lib/config'
import { useSupplyRate, useBorrowRate, useCollateralFactor, usePrice, useTotalSupply, useTotalBorrow } from '@/hooks/lend'
import { formatCompactNumber, formatCompactCurrency, formatCompactPercent } from '@/utils/formatNumbers'
import SupplyList from './components/SupplyList'

interface Asset {
	name: string
	icon: string
	supply?: boolean
	borrow?: boolean
	active?: boolean
	ctokenAddress: { [key: number]: string }
	underlyingAddress: { [key: number]: string }
	llamaId?: string
	isPT?: boolean
	underlyingDecimals: number
}

interface MarketCardProps {
	market: {
		name: string
		type: string
		desc: string
		active: boolean
		assets: Asset[]
	}
}

interface AssetStatsBoxProps {
	asset: {
		name: string
		icon: string
		supply?: boolean
		borrow?: boolean
		active?: boolean
		ctokenAddress: { [key: number]: string }
		underlyingAddress: { [key: number]: string }
		llamaId?: string
		isPT?: boolean
	}
	marketName: string
}

interface GroupedAsset {
	icon: string
	variants: string[]
}

interface AssetGroup {
	[key: string]: GroupedAsset
}

const AssetStatsBox: FC<AssetStatsBoxProps> = ({ asset, marketName }) => {
	const { active: isWalletConnected } = useWeb3React()
	const [hasError, setHasError] = useState(false)

	// Call hooks only if wallet is connected
	const supplyData = isWalletConnected ? useTotalSupply(marketName, asset.ctokenAddress) : null
	const borrowData = isWalletConnected ? useTotalBorrow(marketName, asset.ctokenAddress) : null
	const rawCollateralFactor = isWalletConnected ? useCollateralFactor(marketName, asset.ctokenAddress) : null
	const rawBorrowRate = isWalletConnected ? useBorrowRate(marketName, asset.ctokenAddress) : null
	const rateData = isWalletConnected ? useSupplyRate(marketName, asset.ctokenAddress) : null

	// Extract values with defaults
	const totalSupply = supplyData?.totalSupply || '0'
	const totalSupplyUSD = supplyData?.totalSupplyUSD || '0'
	const totalBorrow = borrowData?.totalBorrow || '0'
	const totalBorrowUSD = borrowData?.totalBorrowUSD || '0'
	const collateralFactor = rawCollateralFactor || '0'
	const borrowRate = rawBorrowRate || '0'
	const { totalApy = '0', lendingApy = '0', underlyingApy = '0' } = rateData || {}

	// Error handling
	useEffect(() => {
		if (!supplyData || !borrowData || !rateData) {
			setHasError(true)
		}
	}, [supplyData, borrowData, rateData])

	// Format values
	const formattedSupply = formatCompactNumber(Number(totalSupply))
	const formattedSupplyUSD = formatCompactCurrency(Number(totalSupplyUSD))
	const formattedBorrow = formatCompactNumber(Number(totalBorrow))
	const formattedBorrowUSD = formatCompactCurrency(Number(totalBorrowUSD))

	if (hasError) {
		return (
			<div className='glassmorphic-card p-4 mb-4'>
				<div className='flex justify-between'>
					<div className='flex-shrink-0 w-1/4'>
						<div className='flex items-center gap-3'>
							<div className='w-8 h-8'>
								<Image src={asset.icon} alt={asset.name} width={32} height={32} />
							</div>
							<div>
								<Typography variant='lg' className='font-bakbak'>
									{asset.name}
								</Typography>
								{asset.supply && !asset.borrow && (
									<Typography variant='sm' className='text-baoWhite/60 border border-baoWhite/20 px-2 py-0.5 rounded text-xs'>
										Collateral Only
									</Typography>
								)}
							</div>
						</div>
					</div>
					<div className='flex-grow grid grid-cols-5 gap-2 text-center'>
						<Typography variant='lg'>-</Typography>
						<Typography variant='lg'>-</Typography>
						<Typography variant='lg'>-</Typography>
						<Typography variant='lg'>-</Typography>
						<Typography variant='lg'>-</Typography>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='glassmorphic-card p-4 mb-4'>
			<div className='flex justify-between'>
				<div className='flex-shrink-0 w-1/4'>
					<div className='flex items-center gap-3'>
						<div className='w-8 h-8'>
							<Image src={asset.icon} alt={asset.name} width={32} height={32} />
						</div>
						<div>
							<Typography variant='lg' className='font-bakbak'>
								{asset.name}
							</Typography>
							{asset.supply && !asset.borrow && (
								<Typography variant='sm' className='text-baoWhite/60 border border-baoWhite/20 px-2 py-0.5 rounded text-xs'>
									Collateral Only
								</Typography>
							)}
						</div>
					</div>
				</div>
				<div className='flex-grow grid grid-cols-5 gap-2 text-center'>
					<div className='flex flex-col'>
						<Typography variant='lg'>{totalSupply !== '0' ? formattedSupply : '-'}</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							{formattedSupplyUSD}
						</Typography>
					</div>
					<Tooltip
						content={
							<div className='p-2'>
								<div className='flex flex-col gap-1'>
									{asset.borrow && (
										<div className='flex justify-between gap-4'>
											<span>Lending</span>
											<span>
												{Number(lendingApy) === 0 ? '0%' : Number(lendingApy) < 0.01 ? '<0.01%' : formatCompactPercent(Number(lendingApy))}
											</span>
										</div>
									)}
									{Number(underlyingApy) > 0 && (
										<div className='flex justify-between gap-4'>
											<span>Base</span>
											<span>{formatCompactPercent(Number(underlyingApy))}</span>
										</div>
									)}
								</div>
							</div>
						}
					>
						<Typography variant='lg'>
							{asset.supply
								? !asset.borrow && Number(underlyingApy) <= 0
									? '-'
									: Number(totalApy) === 0
										? '0%'
										: Number(totalApy) < 0.01
											? '<0.01%'
											: formatCompactPercent(Number(totalApy))
								: '-'}
						</Typography>
					</Tooltip>
					<Typography variant='lg'>{asset.supply ? formatCompactPercent(Number(collateralFactor)) : '-'}</Typography>
					<div className='flex flex-col'>
						{asset.borrow ? (
							<>
								<Typography variant='lg'>{totalBorrow !== '0' ? formattedBorrow : '-'}</Typography>
								<Typography variant='sm' className='text-baoWhite/60'>
									{formattedBorrowUSD}
								</Typography>
							</>
						) : (
							<Typography variant='lg'>-</Typography>
						)}
					</div>
					<Typography variant='lg'>{asset.borrow ? formatCompactPercent(Number(borrowRate)) : '-'}</Typography>
				</div>
			</div>
		</div>
	)
}

const groupSimilarAssets = (assets: Array<Asset>): AssetGroup => {
	return assets.reduce((acc: AssetGroup, asset) => {
		// Check if it's a Pendle PT token by checking isPT flag
		if (asset.isPT) {
			// Use a single key for all PT tokens
			const baseToken = 'PT'
			if (!acc[baseToken]) {
				acc[baseToken] = {
					icon: asset.icon || '/images/tokens/pendle.png', // Fallback to pendle logo
					variants: [],
				}
			}
			// Only add to variants if not already included
			if (!acc[baseToken].variants.includes(asset.name)) {
				acc[baseToken].variants.push(asset.name)
			}
		} else {
			// Regular token, use as is
			if (!acc[asset.name]) {
				acc[asset.name] = {
					icon: asset.icon,
					variants: [asset.name],
				}
			}
		}
		return acc
	}, {})
}

interface AssetRowProps {
	asset: {
		name: string
		icon: string
		ctokenAddress: { [key: number]: string }
		underlyingAddress: { [key: number]: string }
		llamaId?: string
		isPT?: boolean
	}
	marketName: string
	supplyBalances: Balance[]
}

const AssetRow: FC<AssetRowProps> = ({ asset, marketName, supplyBalances }) => {
	const { chainId = 1 } = useWeb3React()

	// Get rates and factors
	const supplyRate = useSupplyRate(marketName, asset.ctokenAddress, asset.llamaId)
	const borrowRate = useBorrowRate(marketName, asset.ctokenAddress)
	const collateralFactor = useCollateralFactor(marketName, asset.ctokenAddress)
	const price = usePrice(marketName, asset.ctokenAddress)

	// Find the balance for this asset
	const assetBalance = supplyBalances.find(b => b.address === asset.underlyingAddress[chainId])

	// Get supplied amount and USD value
	const suppliedAmount = assetBalance?.balance || '0'
	const suppliedUSD = assetBalance?.balanceUSD || '0'

	// Get borrowed amount (if available)
	const borrowedAmount = assetBalance?.borrowed || '0'
	const borrowedUSD = Number(borrowedAmount) * Number(price)

	return (
		<div className='grid grid-cols-6 gap-4 py-4 border-b border-gray-800'>
			{/* Asset Name/Logo */}
			<div className='flex items-center gap-2'>
				<Image src={asset.icon} alt={asset.name} height={32} width={32} className='rounded-full' />
				<div>
					<Typography variant='lg'>{asset.name}</Typography>
				</div>
			</div>

			{/* Supplied Amount */}
			<div>
				<Typography variant='lg'>{formatCompactNumber(Number(suppliedAmount))}</Typography>
				<Typography variant='sm' className='text-gray-400'>
					${formatCompactNumber(Number(suppliedUSD))}
				</Typography>
			</div>

			{/* Supply APY */}
			<div>
				<Typography variant='lg'>{Number(supplyRate).toFixed(2)}%</Typography>
				{asset.llamaId && (
					<Typography variant='sm' className='text-gray-400'>
						+{Number(supplyRate.underlyingApy).toFixed(2)}% underlying
					</Typography>
				)}
			</div>

			{/* Max LTV */}
			<div>
				<Typography variant='lg'>{collateralFactor ? Math.round(Number(collateralFactor) * 100) + '%' : <Loader />}</Typography>
			</div>

			{/* Borrowed Amount */}
			<div>
				<Typography variant='lg'>{formatCompactNumber(Number(borrowedAmount))}</Typography>
				<Typography variant='sm' className='text-gray-400'>
					${formatCompactNumber(borrowedUSD)}
				</Typography>
			</div>

			{/* Borrow APR */}
			<div>
				<Typography variant='lg'>{Number(borrowRate).toFixed(2)}%</Typography>
			</div>
		</div>
	)
}

const MarketCard: FC<MarketCardProps> = ({ market }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [showArchived, setShowArchived] = useState(false)
	const { chainId = 1 } = useWeb3React()
	const { data: supplyBalances } = useAccountBalances()
	const router = useRouter()

	const visibleAssets = useMemo(() => {
		return market.assets.filter(asset => showArchived || asset.active !== false)
	}, [market.assets, showArchived])

	const { totalSuppliedUSD = '0', totalBorrowedUSD = '0' } = useMarketTotals(market.name) || {}

	// Handler for manage button click
	const handleManageClick = (e: React.MouseEvent) => {
		e.stopPropagation() // Prevent event from bubbling to header
		router.push({
			pathname: `/lend/${market.name}/positions`,
		})
	}

	return (
		<div className='rounded-lg border border-gray-800'>
			<div className='w-full px-6 py-4 flex items-center cursor-pointer hover:bg-baoRed/5' onClick={() => setIsExpanded(!isExpanded)}>
				{/* Market Name - 1/6 */}
				<div className='w-1/6'>
					<Typography variant='lg' className='font-bakbak'>
						{market.name}
					</Typography>
				</div>

				{/* Supply Tokens - 1/6 */}
				<div className='w-1/6'>
					<Typography variant='xs' className='text-gray-400 mb-1'>
						Supply Assets
					</Typography>
					<div className='flex -space-x-2'>
						{visibleAssets
							.filter(asset => asset.supply)
							.map(asset => (
								<Tooltip key={asset.name} content={asset.name}>
									<div>
										<Image
											src={asset.icon}
											alt={asset.name}
											className='inline-block rounded-full ring-2 ring-black'
											height={24}
											width={24}
										/>
									</div>
								</Tooltip>
							))}
					</div>
				</div>

				{/* Borrow Tokens - 1/6 */}
				<div className='w-1/6'>
					<Typography variant='xs' className='text-gray-400 mb-1'>
						Borrow Assets
					</Typography>
					<div className='flex -space-x-2'>
						{visibleAssets
							.filter(asset => asset.borrow)
							.map(asset => (
								<Tooltip key={asset.name} content={asset.name}>
									<div>
										<Image
											src={asset.icon}
											alt={asset.name}
											className='inline-block rounded-full ring-2 ring-black'
											height={24}
											width={24}
										/>
									</div>
								</Tooltip>
							))}
					</div>
				</div>

				{/* Total Supplied - 1/6 */}
				<div className='w-1/6'>
					<Typography variant='xs' className='text-gray-400 mb-1'>
						Total Supplied
					</Typography>
					<Typography variant='lg'>{formatCompactCurrency(Number(totalSuppliedUSD))}</Typography>
				</div>

				{/* Total Borrowed - 1/6 */}
				<div className='w-1/6'>
					<Typography variant='xs' className='text-gray-400 mb-1'>
						Total Borrowed
					</Typography>
					<Typography variant='lg'>{formatCompactCurrency(Number(totalBorrowedUSD))}</Typography>
				</div>

				{/* Manage & Expand - 1/6 */}
				<div className='w-1/6 flex justify-end gap-4'>
					<button className='px-4 py-2 rounded-lg bg-baoRed/10 hover:bg-baoRed/20' onClick={handleManageClick}>
						<Typography variant='sm'>Manage</Typography>
					</button>
					<button
						onClick={e => {
							e.stopPropagation()
							setIsExpanded(!isExpanded)
						}}
						className='flex items-center'
					>
						<FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className='h-4 w-4 text-gray-400' />
					</button>
				</div>
			</div>

			{isExpanded && (
				<div className='mt-4'>
					{/* Archive Toggle Switch */}
					<div className='px-6 pb-4 flex items-center gap-2'>
						<div className='relative inline-flex cursor-pointer' onClick={() => setShowArchived(!showArchived)}>
							<input type='checkbox' className='sr-only' checked={showArchived} onChange={() => setShowArchived(!showArchived)} />
							<div
								className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${showArchived ? 'bg-baoRed' : 'bg-gray-600'}`}
							>
								<div
									className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
										showArchived ? 'translate-x-6' : 'translate-x-1'
									} my-0.5`}
								/>
							</div>
						</div>
						<Typography variant='sm' className='text-gray-400'>
							Show Archived Assets
						</Typography>
					</div>

					<SupplyList
						marketName={market.name}
						supplyBalances={supplyBalances || []}
						totalSupply={totalSuppliedUSD}
						market={{ ...market, assets: visibleAssets }}
					/>
				</div>
			)}
		</div>
	)
}

const Markets: FC = () => {
	const markets = Object.entries(Config.vaults).map(([name, market]) => {
		console.log('Processing market:', name, {
			marketType: market.type,
			assetCount: market.assets.length,
		})

		const mappedAssets = market.assets.map(asset => {
			// Add debug logging for each asset
			console.log('Processing asset:', {
				marketName: name,
				assetName: asset.name,
				originalLlamaId: asset.llamaId,
				configLlamaIds: Config.llamaIds,
			})

			// Get llamaId with case-insensitive matching
			let llamaId = asset.llamaId // Keep any directly defined llamaIds
			if (!llamaId) {
				const assetName = asset.name.toLowerCase().trim()
				console.log('Checking asset name:', assetName)

				if (assetName === 'wsteth') {
					llamaId = Config.llamaIds.wstETH
				} else if (assetName === 'reth') {
					llamaId = Config.llamaIds.rETH
				} else if (assetName === 'weeth') {
					llamaId = 'ether-fi-staked-eth'
				} else if (assetName === 'susde') {
					llamaId = 'ethena-susde'
				}
			}

			// Log the final mapping result
			console.log('Asset mapping result:', {
				marketName: name,
				assetName: asset.name,
				finalLlamaId: llamaId,
			})

			return {
				...asset,
				llamaId,
				ctokenAddress: {
					[Config.networkId]:
						asset.ctokenAddress?.[Config.networkId] || (typeof asset.ctokenAddress === 'string' ? asset.ctokenAddress : ''),
				},
				underlyingAddress: {
					[Config.networkId]:
						asset.underlyingAddress?.[Config.networkId] || (typeof asset.underlyingAddress === 'string' ? asset.underlyingAddress : ''),
				},
			}
		})

		return {
			name,
			type: market.type,
			desc: market.desc,
			active: market.active,
			assets: mappedAssets,
		}
	})

	// Log the final mapped markets
	console.log(
		'Final mapped markets:',
		markets.map(m => ({
			name: m.name,
			assetCount: m.assets.length,
			assets: m.assets.map(a => ({
				name: a.name,
				llamaId: a.llamaId,
			})),
		})),
	)

	const sortedMarkets = markets.sort((a, b) => {
		if (a.type === 'core market' && b.type !== 'core market') return -1
		if (a.type !== 'core market' && b.type === 'core market') return 1
		return a.name.localeCompare(b.name)
	})

	return (
		<div className='flex flex-col gap-8'>
			{sortedMarkets.map(market => {
				console.log('Passing market to MarketCard:', {
					name: market.name,
					assets: market.assets.map(a => ({
						name: a.name,
						llamaId: a.llamaId,
					})),
				})
				return <MarketCard key={market.name} market={market} />
			})}
		</div>
	)
}

const LendPage: NextPage = () => {
	// First, get the dependencies for our hooks
	const { marketName, ctokenAddress } = useMemo(
		() => ({
			marketName: '',
			ctokenAddress: {},
		}),
		[],
	)

	// Call hooks unconditionally at the top level
	const totalSupply = useTotalSupply(marketName, ctokenAddress)
	const totalBorrow = useTotalBorrow(marketName, ctokenAddress)
	const collateralFactor = useCollateralFactor(marketName, ctokenAddress)
	const borrowRate = useBorrowRate(marketName, ctokenAddress)
	const supplyRate = useSupplyRate(marketName, ctokenAddress)

	return (
		<div className='w-[1024px] mx-auto px-4 py-8'>
			<Typography variant='h1' className='mb-8'>
				Lending Markets
			</Typography>
			<Markets />
		</div>
	)
}

export default LendPage
