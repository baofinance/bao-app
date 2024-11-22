import { ListHeader } from '@/components/List'
import Loader, { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import Tooltipped from '@/components/Tooltipped'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/future/image'
import Link from 'next/link'
import Config from '@/bao/lib/config'
import React, { useState } from 'react'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import Button from '@/components/Button'
import { getDisplayBalance } from '@/utils/numberFormat'
import { useTotalSupplies } from '@/hooks/lend/useTotalSupplies'
import { useOraclePrices } from '@/hooks/lend/useOraclePrices'
import { useTotalDebt } from '@/hooks/lend/useTotalDebt'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { BigNumber } from 'ethers'
import { useComptrollerData } from '@/hooks/lend/useComptrollerData'
import { useDefiLlamaApr } from '@/hooks/lend/useDefiLlamaApr'

export const MarketList: React.FC = () => {
	const markets = Config.lendMarkets

	return (
		<>
			<ListHeader headers={['Market', '']} />
			<div className='flex flex-col gap-4'>
				{markets == null && <PageLoader block />}
				{Object.keys(markets).map((marketName, index) => (
					<MarketListItem key={index} marketName={marketName} />
				))}
			</div>
		</>
	)
}

export const MarketListItem: React.FC<MarketListProps> = ({ marketName }: MarketListProps) => {
	const { account, chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const [isExpanded, setIsExpanded] = useState(false)
	const defiLlamaAprs = useDefiLlamaApr()

	// Add comptroller data hook to get collateral factors
	const comptrollerData = useComptrollerData(marketName)

	// Add missing hooks
	const totalSupplies = useTotalSupplies(marketName)
	const oraclePrices = useOraclePrices(marketName)
	const totalDebts = useTotalDebt(marketName)
	const borrowApy = useBorrowApy(marketName)

	// Filter active assets
	const supplyAssets = market.assets.filter(asset => asset.supply && asset.active)
	const borrowAssets = market.assets.filter(asset => asset.supply && asset.borrow && asset.active)

	// Sort assets to show collateral-only first
	const sortedAssets = [...supplyAssets].sort((a, b) => {
		// If a is collateral-only (supply true, borrow false) and b is not, a comes first
		if (a.supply && !a.borrow && (b.borrow || !b.supply)) return -1
		// If b is collateral-only and a is not, b comes first
		if (b.supply && !b.borrow && (a.borrow || !a.supply)) return 1
		return 0
	})

	// Group assets by their `group` property
	const groupedSupply = Object.values(
		supplyAssets.reduce(
			(groups, asset: any) => {
				const groupName = asset.group || asset.name
				if (!groups[groupName]) {
					groups[groupName] = {
						icon: asset.icon,
						groupName,
					}
				}
				return groups
			},
			{} as Record<string, { icon: string; groupName: string }>,
		),
	)

	const groupedBorrow = Object.values(
		borrowAssets.reduce(
			(groups, asset: any) => {
				const groupName = asset.group || asset.name
				if (!groups[groupName]) {
					groups[groupName] = {
						icon: asset.icon,
						groupName,
					}
				}
				return groups
			},
			{} as Record<string, { icon: string; groupName: string }>,
		),
	)

	const handleManageClick = (e: React.MouseEvent) => {
		e.stopPropagation() // Prevent the click from bubbling up to the parent
	}

	return (
		market && (
			<div className='flex flex-col'>
				<button onClick={() => setIsExpanded(!isExpanded)} className='glassmorphic-card w-full px-4 py-2'>
					<div className='flex w-full flex-row items-center justify-between'>
						<div className='flex items-center gap-8 flex-1'>
							<div className='flex items-center gap-4 w-[250px]'>
								<div className='flex items-center'>
									<Image src={market.assets[0]?.icon || ''} alt={market.name} className={`inline-block`} height={38} width={38} />
								</div>
								<div className='flex flex-col text-left'>
									<Typography variant='lg' className='font-bakbak'>
										{market.name}
									</Typography>
									<Typography variant='sm' className='text-baoWhite'>
										{market.desc}
									</Typography>
								</div>
							</div>

							<div className='flex-1 flex items-center justify-center gap-8'>
								<div className='flex flex-col items-center'>
									<Typography variant='sm' className='text-baoWhite mb-2'>
										Supply
									</Typography>
									<div className='flex items-center'>
										{groupedSupply.map(asset => (
											<Tooltipped content={asset.groupName} key={asset.groupName} placement='bottom'>
												<div className='flex items-center -ml-2 first:ml-0'>
													<Image src={asset.icon} alt={asset.groupName} className='inline-block' height={32} width={32} />
												</div>
											</Tooltipped>
										))}
									</div>
								</div>

								<div className='flex flex-col items-center'>
									<Typography variant='sm' className='text-baoWhite mb-2'>
										Borrow
									</Typography>
									<div className='flex items-center'>
										{groupedBorrow.map(asset => (
											<Tooltipped content={asset.groupName} key={asset.groupName} placement='bottom'>
												<div className='flex items-center -ml-2 first:ml-0'>
													<Image src={asset.icon} alt={asset.groupName} className='inline-block' height={32} width={32} />
												</div>
											</Tooltipped>
										))}
									</div>
								</div>
							</div>

							<div className='flex items-center gap-4 ml-auto'>
								<Link href={account ? `/lend/${market.name}` : '#'} onClick={handleManageClick}>
									<Button disabled={!account} className='px-4 py-2'>
										Manage
									</Button>
								</Link>
								<FontAwesomeIcon icon={isExpanded ? faAngleUp : faAngleDown} className='ml-4' />
							</div>
						</div>
					</div>
				</button>

				<Transition
					show={isExpanded}
					enter='transition ease-out duration-200'
					enterFrom='opacity-0 -translate-y-1'
					enterTo='opacity-100 translate-y-0'
					leave='transition ease-in duration-150'
					leaveFrom='opacity-100 translate-y-0'
					leaveTo='opacity-0 -translate-y-1'
				>
					<div className='glassmorphic-card mt-2 p-4'>
						<div className='w-full'>
							<div className='grid grid-cols-7 gap-4 border-b border-baoWhite/20 pb-2 mb-4'>
								<div className='col-span-2'></div>
								<Typography variant='sm' className='text-baoWhite text-right'>
									Total Supplied
								</Typography>
								<Typography variant='sm' className='text-baoWhite text-right'>
									Supply APY
								</Typography>
								<Typography variant='sm' className='text-baoWhite text-right'>
									Max LTV
								</Typography>
								<Typography variant='sm' className='text-baoWhite text-right'>
									Total Borrowed
								</Typography>
								<Typography variant='sm' className='text-baoWhite text-right'>
									Borrow APR
								</Typography>
							</div>

							{sortedAssets.map((asset, index) => {
								const assetSupply = totalSupplies?.find(
									supply => supply.address.toLowerCase() === asset.marketAddress[chainId]?.toLowerCase(),
								)

								const assetPrice = oraclePrices[asset.marketAddress[chainId]] || BigNumber.from(0)
								const assetDebt = totalDebts[asset.marketAddress[chainId]] || BigNumber.from(0)

								const supplyAmount = assetSupply ? getDisplayBalance(assetSupply.totalSupply, asset.underlyingDecimals) : '0.00'
								const supplyInUSD =
									assetSupply && assetPrice
										? `$${getDisplayBalance(
												assetSupply.totalSupply.mul(assetPrice).div(BigNumber.from(10).pow(18)),
												asset.underlyingDecimals,
												2,
											)}`
										: '$0.00'

								const borrowAmount = assetDebt ? getDisplayBalance(assetDebt, asset.underlyingDecimals) : '0.00'
								const borrowInUSD =
									assetDebt && assetPrice
										? `$${getDisplayBalance(assetDebt.mul(assetPrice).div(BigNumber.from(10).pow(18)), asset.underlyingDecimals, 2)}`
										: '$0.00'

								// Get collateral factor for this specific asset and ensure it's loaded
								const assetComptrollerData = comptrollerData?.find(
									data => data.address.toLowerCase() === asset.marketAddress[chainId]?.toLowerCase(),
								)

								// Format the collateral factor with proper scaling
								const collateralFactorDisplay = assetComptrollerData?.collateralFactor
									? getDisplayBalance(assetComptrollerData.collateralFactor.mul(100), 18, 0)
									: '0'

								const assetBorrowApy = borrowApy[asset.marketAddress[chainId]?.toLowerCase()] || BigNumber.from(0)

								const underlyingApr = defiLlamaAprs.data?.[asset.name] || 0

								return (
									<div key={index} className='grid grid-cols-7 gap-4 py-2 border-b border-baoWhite/10 last:border-0'>
										<div className='flex items-center gap-2 col-span-2'>
											<Image src={asset.icon} alt={asset.name} className='inline-block' height={24} width={24} />
											<div className='flex flex-col'>
												<Typography>{asset.name}</Typography>
												{asset.supply && !asset.borrow && (
													<Typography variant='xs' className='border border-baoWhite/10 rounded px-1 w-fit text-baoWhite/40'>
														Collateral Only
													</Typography>
												)}
											</div>
										</div>

										<div className='text-right'>
											<Typography>{supplyAmount}</Typography>
											<Typography variant='sm' className='text-baoWhite/60'>
												{supplyInUSD}
											</Typography>
										</div>

										<Tooltipped
											content={
												<div className='flex flex-col gap-1'>
													{underlyingApr > 0 && (
														<div>
															<span className='font-bold'>Underlying APR: </span>
															{underlyingApr.toFixed(2)}%
														</div>
													)}
													<div>
														<span className='font-bold'>Lend APR: </span>
														0.00%
													</div>
													<div className='border-t border-baoWhite/20 mt-1 pt-1'>
														<span className='font-bold'>Total APR: </span>
														{underlyingApr.toFixed(2)}%
													</div>
												</div>
											}
											placement='top'
										>
											<Typography className='text-right'>{underlyingApr.toFixed(2)}%</Typography>
										</Tooltipped>

										<Typography className='text-right'>
											{Config.lendMarkets[marketName].collateralFactor
												? getDisplayBalance(Config.lendMarkets[marketName].collateralFactor.mul(100), 18, 0) + '%'
												: '-'}
										</Typography>

										<div className='text-right'>
											{!asset.borrow ? (
												<div>
													<Typography>-</Typography>
													<Typography variant='sm' className='text-baoWhite/60'>
														-
													</Typography>
												</div>
											) : (
												<>
													<Typography>{borrowAmount}</Typography>
													<Typography variant='sm' className='text-baoWhite/60'>
														{borrowInUSD}
													</Typography>
												</>
											)}
										</div>

										<Typography className='text-right'>
											{!asset.borrow
												? '-'
												: assetBorrowApy === null
													? '-'
													: assetBorrowApy.gt(0)
														? `${getDisplayBalance(assetBorrowApy, 18, 2)}% APR`
														: '-'}
										</Typography>
									</div>
								)
							})}
						</div>
					</div>
				</Transition>
			</div>
		)
	)
}

export default MarketList

type MarketListProps = {
	marketName: string
}
