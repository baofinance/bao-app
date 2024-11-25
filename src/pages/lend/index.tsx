import { FC, useState } from 'react'
import Container from '@/components/Container'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import { ListHeader } from '@/components/List'
import Link from 'next/link'
import Image from 'next/future/image'
import Config from '@/bao/lib/config'
import { LendMarket } from '@/bao/lib/types'
import { useVaultsByType } from '@/hooks/vaults/useVaults'
import { useWeb3React } from '@web3-react/core'
import Tooltipped from '@/components/Tooltipped'
import { useSupplyRate } from '@/hooks/lend/useSupplyRate'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { useTotalSupplies } from '@/hooks/lend/useTotalSupplies'
import { useTotalDebt } from '@/hooks/lend/useTotalDebt'
import { getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { useDefiLlamaApr } from '@/hooks/lend/useDefiLlamaApr'
import { useExchangeRates } from '@/hooks/lend/useExchangeRate'

const formatNumber = (value: number | BigNumber, decimals = 2): string => {
	if (BigNumber.isBigNumber(value)) {
		return getDisplayBalance(value, 18, decimals)
	}
	return value.toFixed(decimals)
}

const CORE_MARKET_ASSETS = {
	baoUSD: {
		supply: [
			{ symbol: 'WETH', name: 'WETH', displayName: 'Wrapped Ether' },
			{ symbol: 'wstETH', name: 'wstETH', displayName: 'Wrapped stETH' },
			{ symbol: 'rETH', name: 'rETH', displayName: 'Rocket Pool ETH' },
		],
		borrow: [{ symbol: 'baoUSD', name: 'baoUSD', displayName: 'BaoUSD' }],
	},
	baoETH: {
		supply: [
			{ symbol: 'WETH', name: 'WETH', displayName: 'Wrapped Ether' },
			{ symbol: 'wstETH', name: 'wstETH', displayName: 'Wrapped stETH' },
			{ symbol: 'rETH', name: 'rETH', displayName: 'Rocket Pool ETH' },
		],
		borrow: [{ symbol: 'baoETH', name: 'baoETH', displayName: 'BaoETH' }],
	},
} as const

// Add type for market names to fix indexing error
type CoreMarketName = keyof typeof CORE_MARKET_ASSETS

const LendPage: FC = () => {
	const { chainId } = useWeb3React()
	const baoUSDVaults = useVaultsByType('baoUSD')
	const baoETHVaults = useVaultsByType('baoETH')

	return (
		<Container className='flex flex-col gap-8'>
			<NextSeo title='Lend' description='Markets to supply and borrow assets.' />

			<Typography variant='hero' className='stroke'>
				MARKETS
			</Typography>

			<div className='flex flex-col gap-4'>
				{/* Vault Markets */}
				<MarketListItem marketName='baoUSD' vaults={baoUSDVaults} />
				<MarketListItem marketName='baoETH' vaults={baoETHVaults} />

				{/* Lending Markets */}
				<MarketListItem marketName='weETH' />
				<MarketListItem marketName='USDe' />
			</div>
		</Container>
	)
}

interface MarketListItemProps {
	marketName: CoreMarketName | string
	vaults?: any[] // Replace with proper vault type
}

interface CoreMarket {
	name: string
	assets: any[]
	marketAddress?: never
}

interface MarketStats {
	totalSupplied: string
	totalSuppliedUsd: string
	supplyApy: string
	maxLtv: string
	totalBorrowed: string
	totalBorrowedUsd: string
	borrowApr: string
}

interface AssetStats {
	totalSupplied: string
	totalSuppliedUsd: string
	supplyApy: string
	maxLtv: string
	totalBorrowed: string
	totalBorrowedUsd: string
	borrowApr: string
}

const MarketListItem: FC<MarketListItemProps> = ({ marketName, vaults }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const { chainId } = useWeb3React()
	const market = vaults ? ({ name: marketName, assets: vaults } as CoreMarket) : (Config.lendMarkets[marketName] as LendMarket)
	const supplyRates = useSupplyRate(marketName)
	const borrowApy = useBorrowApy(marketName)
	const totalSupplies = useTotalSupplies(marketName)
	const totalDebts = useTotalDebt(marketName)
	const defiLlamaAprs = useDefiLlamaApr()
	const exchangeRates = useExchangeRates(marketName)

	if (!market) return null

	const isCore = vaults !== undefined
	const isCoreMarket = (name: string): name is CoreMarketName => name === 'baoUSD' || name === 'baoETH'

	// Use the type guard when accessing CORE_MARKET_ASSETS
	const getCoreMarketAssets = () => {
		if (isCore && isCoreMarket(marketName)) {
			return CORE_MARKET_ASSETS[marketName]
		}
		return null
	}

	const coreAssets = getCoreMarketAssets()

	// Helper function to get stats for a specific asset
	const getAssetStats = (asset: any): AssetStats => {
		if (isCore) {
			return {
				totalSupplied: '0.00',
				totalSuppliedUsd: '0.00',
				supplyApy: '0.00',
				maxLtv: asset.maxLtv?.toString() || '-',
				totalBorrowed: '-',
				totalBorrowedUsd: '-',
				borrowApr: '-',
			}
		}

		const marketAddr = (market as LendMarket).marketAddresses?.[chainId]
		const assetSupply = totalSupplies?.find(supply => supply.address === asset.marketAddress[chainId])?.totalSupply || BigNumber.from(0)
		const assetDebt = totalDebts[asset.marketAddress[chainId]] || BigNumber.from(0)
		const supplyRate = supplyRates[asset.marketAddress[chainId]] || BigNumber.from(0)
		const borrowRate = borrowApy[asset.marketAddress[chainId]?.toLowerCase()] || BigNumber.from(0)
		const exchangeRate = exchangeRates[asset.marketAddress[chainId]] || BigNumber.from(0)
		const underlyingApr = defiLlamaAprs.data?.[asset.name] ?? 0

		// Calculate total APY including underlying yield
		const totalSupplyApy = underlyingApr + parseFloat(getDisplayBalance(supplyRate, 18, 2))

		// Calculate USD values using exchange rate
		const totalSuppliedUsd = assetSupply.mul(exchangeRate).div(BigNumber.from(10).pow(18))
		const totalBorrowedUsd = assetDebt.mul(exchangeRate).div(BigNumber.from(10).pow(18))

		return {
			totalSupplied: formatNumber(assetSupply),
			totalSuppliedUsd: formatNumber(totalSuppliedUsd),
			supplyApy: formatNumber(totalSupplyApy),
			maxLtv: asset.maxLtv?.toString() || '-',
			totalBorrowed: formatNumber(assetDebt),
			totalBorrowedUsd: formatNumber(totalBorrowedUsd),
			borrowApr: formatNumber(borrowRate),
		}
	}

	// Update getMarketStats to use marketAddresses instead of marketAddress
	const getMarketStats = (): MarketStats => {
		if (isCore) {
			return {
				totalSupplied: '0.00',
				totalSuppliedUsd: '0.00',
				supplyApy: '0.00',
				maxLtv: '-',
				totalBorrowed: '-',
				totalBorrowedUsd: '-',
				borrowApr: '-',
			}
		}

		const marketAddr = (market as LendMarket).marketAddresses?.[chainId]
		const totalSupply = totalSupplies?.[0]?.totalSupply || BigNumber.from(0)
		const totalDebt = totalDebts[marketAddr] || BigNumber.from(0)

		return {
			totalSupplied: getDisplayBalance(totalSupply),
			totalSuppliedUsd: getDisplayBalance(totalSupply), // Add price calculation
			supplyApy: getDisplayBalance(supplyRates[marketAddr] || BigNumber.from(0)),
			maxLtv: '-',
			totalBorrowed: getDisplayBalance(totalDebt),
			totalBorrowedUsd: getDisplayBalance(totalDebt), // Add price calculation
			borrowApr: getDisplayBalance(borrowApy[marketAddr?.toLowerCase()] || BigNumber.from(0)),
		}
	}

	const stats = getMarketStats()

	const coreMarketInfo = (
		<div className='flex flex-col gap-2'>
			<div>Core markets use the highest quality ETH and BTC based collateralized debt positions to back bao derivatives.</div>
			<a
				href='https://info.bao.finance/docs/core-markets'
				target='_blank'
				rel='noopener noreferrer'
				className='text-baoRed hover:text-baoRed/80 underline'
				onClick={e => e.stopPropagation()}
			>
				read more here
			</a>
		</div>
	)

	const insuredMarketInfo = (
		<div className='flex flex-col gap-2'>
			<div>Lend and borrow in isolated markets that are insured from bad debt by sbaoUSD and sbaoETH holders.</div>
			<a
				href='https://info.bao.finance/docs/insured-markets'
				target='_blank'
				rel='noopener noreferrer'
				className='text-baoRed hover:text-baoRed/80 underline'
				onClick={e => e.stopPropagation()}
			>
				read more here
			</a>
		</div>
	)

	// Add a helper function to get the correct icon path
	const getIconPath = (symbol: string) => {
		return `/images/tokens/${symbol}.png`
	}

	const renderExpandedView = () => {
		if (isCore) {
			// For core markets, show supply and borrow assets from our mapping
			return (
				<div className='mt-2 glassmorphic-card p-4'>
					<div className='flex flex-col gap-4'>
						{/* Table Headers */}
						<div className='grid grid-cols-6 gap-4 px-4 py-2'>
							<Typography variant='sm' className='text-baoWhite/60'>
								Asset
							</Typography>
							<Typography variant='sm' className='text-baoWhite/60'>
								Total Supplied
							</Typography>
							<Typography variant='sm' className='text-baoWhite/60'>
								Supply APY
							</Typography>
							<Typography variant='sm' className='text-baoWhite/60'>
								Max LTV
							</Typography>
							<Typography variant='sm' className='text-baoWhite/60'>
								Total Borrowed
							</Typography>
							<Typography variant='sm' className='text-baoWhite/60'>
								Borrow APR
							</Typography>
						</div>

						{/* Supply Assets */}
						{coreAssets?.supply.map(asset => (
							<div key={asset.symbol} className='grid grid-cols-6 gap-4 px-4 py-2 glassmorphic-card'>
								<div className='flex items-center gap-2'>
									<Image src={`/images/tokens/${asset.symbol}.png`} alt={asset.name} width={28} height={28} />
									<div className='flex flex-col'>
										<Typography variant='lg' className='font-bakbak'>
											{asset.name}
										</Typography>
										<span className='inline-block w-24 px-2 py-0.5 text-[9px] font-bakbak text-baoWhite/60 bg-baoblack border border-baoWhite/40 rounded text-center'>
											Collateral Only
										</span>
									</div>
								</div>
								{/* Stats columns */}
								<div className='flex flex-col justify-center'>
									<Typography variant='lg'>0.00</Typography>
									<Typography variant='sm' className='text-baoWhite/60'>
										$0.00
									</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>0.00%</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>-</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>-</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>-</Typography>
								</div>
							</div>
						))}

						{/* Borrow Asset */}
						{coreAssets?.borrow.map(asset => (
							<div key={asset.symbol} className='grid grid-cols-6 gap-4 px-4 py-2 glassmorphic-card'>
								<div className='flex items-center gap-2'>
									<Image src={`/images/tokens/${asset.symbol}.png`} alt={asset.name} width={28} height={28} />
									<Typography variant='lg' className='font-bakbak'>
										{asset.name}
									</Typography>
								</div>
								{/* Stats columns */}
								<div className='flex flex-col justify-center'>
									<Typography variant='lg'>0.00</Typography>
									<Typography variant='sm' className='text-baoWhite/60'>
										$0.00
									</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>0.00%</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>-</Typography>
								</div>
								<div className='flex flex-col justify-center'>
									<Typography variant='lg'>0.00</Typography>
									<Typography variant='sm' className='text-baoWhite/60'>
										$0.00
									</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>0.00%</Typography>
								</div>
							</div>
						))}
					</div>
				</div>
			)
		}

		// Non-core market expanded view
		return (
			<div className='mt-2 glassmorphic-card p-4'>
				<div className='flex flex-col gap-4'>
					{/* Table Headers */}
					<div className='grid grid-cols-6 gap-4 px-4 py-2'>
						<Typography variant='sm' className='text-baoWhite/60'>
							Asset
						</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							Total Supplied
						</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							Supply APY
						</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							Max LTV
						</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							Total Borrowed
						</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							Borrow APR
						</Typography>
					</div>

					{/* Asset Rows */}
					{market.assets.map((asset: any) => {
						const assetStats = getAssetStats(asset)
						return (
							<div key={asset.id || asset.mid} className='grid grid-cols-6 gap-4 px-4 py-2 glassmorphic-card'>
								{/* Asset Column */}
								<div className='flex items-center gap-2'>
									<Image src={asset.icon} alt={asset.name} width={28} height={28} />
									<div className='flex flex-col'>
										<Typography variant='lg' className='font-bakbak'>
											{asset.name}
										</Typography>
										{/* Show Collateral Only tag for any asset that's supply-only */}
										{asset.supply && !asset.borrow && (
											<span className='inline-block w-24 px-2 py-0.5 text-[9px] font-bakbak text-baoWhite/60 bg-baoblack border border-baoWhite/40 rounded text-center'>
												Collateral Only
											</span>
										)}
									</div>
								</div>

								{/* Stats Columns */}
								<div className='flex flex-col justify-center'>
									<Typography variant='lg'>{assetStats.totalSupplied}</Typography>
									<Typography variant='sm' className='text-baoWhite/60'>
										${assetStats.totalSuppliedUsd}
									</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>{assetStats.supplyApy}%</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>{assetStats.maxLtv}</Typography>
								</div>
								<div className='flex flex-col justify-center'>
									<Typography variant='lg'>{assetStats.totalBorrowed}</Typography>
									<Typography variant='sm' className='text-baoWhite/60'>
										${assetStats.totalBorrowedUsd}
									</Typography>
								</div>
								<div className='flex items-center'>
									<Typography variant='lg'>{assetStats.borrowApr}%</Typography>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col'>
			{/* Unexpanded View */}
			<div className='w-full glassmorphic-card px-4 py-2'>
				<div className='flex w-full items-center'>
					<button onClick={() => setIsExpanded(!isExpanded)} className='flex flex-1 items-center'>
						<div className='w-1/3 flex items-center gap-2'>
							<Image src={`/images/tokens/${marketName}.png`} alt={marketName} width={36} height={36} />
							<div className='flex flex-col items-start'>
								<Typography variant='lg' className='font-bakbak'>
									{market.name}
								</Typography>
								{isCore ? (
									<Tooltipped content={coreMarketInfo} placement='bottom' interactive={true} delay={[0, 500]}>
										<span className='px-2 py-0.5 text-[11px] font-bakbak text-black bg-baoWhite/80 rounded cursor-help'>Core Market</span>
									</Tooltipped>
								) : (
									<Tooltipped content={insuredMarketInfo} placement='bottom' interactive={true} delay={[0, 500]}>
										<span className='px-2 py-0.5 text-[11px] font-bakbak text-black bg-baoWhite/80 rounded cursor-help'>
											Insured Lend Market
										</span>
									</Tooltipped>
								)}
							</div>
						</div>
						<div className='w-1/3 flex justify-center'>
							{/* Supply Icons */}
							<div className='flex flex-col items-center'>
								<Typography variant='sm' className='mb-2 text-baoWhite/40 text-[10px] uppercase tracking-wider'>
									Supply
								</Typography>
								<div className='flex items-center'>
									{isCore
										? // Core market supply assets - ONLY show our defined supply assets
											coreAssets?.supply
												.filter(asset => ['WETH', 'wstETH', 'rETH'].includes(asset.symbol))
												.map(asset => (
													<Tooltipped key={asset.symbol} content={asset.displayName} placement='top'>
														<div className='-ml-3 first:ml-0'>
															<Image src={`/images/tokens/${asset.symbol}.png`} alt={asset.name} width={32} height={32} />
														</div>
													</Tooltipped>
												))
										: // Non-core market supply assets
											market.assets
												.filter(asset => asset.supply)
												.map((asset: any) => (
													<Tooltipped key={asset.id || asset.mid} content={asset.displayName} placement='top'>
														<div className='-ml-3 first:ml-0'>
															<Image src={asset.icon} alt={asset.name} width={32} height={32} />
														</div>
													</Tooltipped>
												))}
								</div>
							</div>
						</div>
						<div className='w-1/3 flex justify-center'>
							{/* Borrow Icons */}
							<div className='flex flex-col items-center'>
								<Typography variant='sm' className='mb-2 text-baoWhite/40 text-[10px] uppercase tracking-wider'>
									Borrow
								</Typography>
								<div className='flex items-center'>
									{isCore
										? // Core market borrow assets - only show borrow assets
											coreAssets?.borrow.map(asset => (
												<Tooltipped key={asset.symbol} content={asset.displayName} placement='top'>
													<div className='-ml-3 first:ml-0'>
														<Image src={`/images/tokens/${asset.symbol}.png`} alt={asset.name} width={32} height={32} />
													</div>
												</Tooltipped>
											))
										: // Non-core market borrow assets
											market.assets
												.filter(asset => asset.borrow)
												.map((asset: any) => (
													<Tooltipped key={asset.id || asset.mid} content={asset.displayName} placement='top'>
														<div className='-ml-3 first:ml-0'>
															<Image src={asset.icon} alt={asset.name} width={32} height={32} />
														</div>
													</Tooltipped>
												))}
								</div>
							</div>
						</div>
					</button>
					<Link href={vaults ? `/vaults/${marketName}` : `/lend/${marketName}`}>
						<button className='glassmorphic-card px-4 py-2 font-bakbak hover:bg-baoRed'>Manage</button>
					</Link>
				</div>
			</div>

			{/* New expanded view */}
			{isExpanded && renderExpandedView()}
		</div>
	)
}

export default LendPage
