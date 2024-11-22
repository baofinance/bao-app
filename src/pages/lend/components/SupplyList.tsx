import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import Config from '@/bao/lib/config'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Asset, Balance } from '@/bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import Button from '@/components/Button'
import SupplyModal from '@/pages/lend/components/Modals/SupplyModal'
import BorrowModal from '@/pages/lend/components/Modals/BorrowModal'
import WithdrawModal from '@/pages/lend/components/Modals/WithdrawModal'
import RepayModal from '@/pages/lend/components/Modals/RepayModal'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'
import { useOraclePrice } from '@/hooks/lend/useOraclePrice'
import { BigNumber } from 'ethers'
import { useSupplyRate } from '@/hooks/lend/useSupplyRate'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { useDefiLlamaApr } from '@/hooks/lend/useDefiLlamaApr'
import Tooltipped from '@/components/Tooltipped'
import { useTotalSupplies } from '@/hooks/lend/useTotalSupplies'
import { useTotalDebt } from '@/hooks/lend/useTotalDebt'

export const SupplyList: React.FC<SupplyListProps> = ({ marketName, supplyBalances }) => {
	const { chainId } = useWeb3React()
	const assets = Config.lendMarkets[marketName].assets
	const supplyAssets = assets.filter(asset => asset.supply && asset.active)
	const borrowableAssets = assets.filter(asset => asset.supply && asset.borrow && asset.active)
	const defiLlamaAprs = useDefiLlamaApr()

	// Get APRs
	const supplyRates = useSupplyRate(marketName)
	const borrowApy = useBorrowApy(marketName)

	// Add state for modals
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const [showWithdrawModal, setShowWithdrawModal] = useState(false)
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [showRepayModal, setShowRepayModal] = useState(false)

	// Get total supplies and debts
	const totalSupplies = useTotalSupplies(marketName)
	const totalDebts = useTotalDebt(marketName)

	// Get oracle prices
	const oraclePrices = useOraclePrice(marketName)

	const renderAprTooltip = (asset: Asset, mode: 'supply' | 'borrow') => {
		const underlyingApr = defiLlamaAprs.data?.[asset.name] ?? 0
		const assetSupplyRate = supplyRates[asset.marketAddress[chainId]] || BigNumber.from(0)
		const assetBorrowApy = borrowApy[asset.marketAddress[chainId]?.toLowerCase()] || BigNumber.from(0)

		if (mode === 'supply') {
			return (
				<div className='flex flex-col gap-1'>
					{underlyingApr > 0 && (
						<div>
							<span className='font-bold'>Underlying APR: </span>
							{underlyingApr.toFixed(2)}%
						</div>
					)}
					<div>
						<span className='font-bold'>Lend APR: </span>
						{assetSupplyRate?.gt(0) ? getDisplayBalance(assetSupplyRate, 18, 2) : '0.00'}%
					</div>
					<div className='border-t border-baoWhite/20 mt-1 pt-1'>
						<span className='font-bold'>Total APR: </span>
						{(underlyingApr + (assetSupplyRate?.gt(0) ? parseFloat(getDisplayBalance(assetSupplyRate, 18, 2)) : 0)).toFixed(2)}%
					</div>
				</div>
			)
		}
		return `Borrow APR: ${assetBorrowApy === null ? '-' : assetBorrowApy?.gt(0) ? getDisplayBalance(assetBorrowApy, 18, 2) : '-'}%`
	}

	// DEBUG: Dummy position data
	const dummyPositions = {
		supplied: [
			{
				asset: 'weETH',
				amount: '10.5',
				value: '$20,000',
				apy: '3.2',
			},
			{
				asset: 'BaoUSD',
				amount: '5000',
				value: '$5,000',
				apy: '2.1',
			},
		],
		borrowed: [
			{
				asset: 'BaoETH',
				amount: '2.5',
				value: '$4,000',
				apy: '4.5',
			},
		],
	}

	return (
		<>
			{/* Position Summary Box */}
			<div className='glassmorphic-card p-4 mb-8 border border-baoRed/10 bg-baoRed/[0.15]'>
				<div className='flex w-full gap-8'>
					{/* Supplied Assets Summary */}
					<div className='flex-1'>
						<Typography variant='lg' className='p-4 text-left font-bakbak'>
							<span className='relative inline-block'>
								<span className='relative z-10'>Supplied Assets</span>
								<span className='absolute inset-0 bg-baoRed translate-y-0 px-4 -mx-4 py-1 -my-1'></span>
							</span>
						</Typography>
						{/* Headers */}
						<div className='flex w-full px-4 mb-2'>
							<div className='w-[40%]'></div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									APR
								</Typography>
							</div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									Your Supplied
								</Typography>
							</div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									Max LTV
								</Typography>
							</div>
							<div className='w-[30%]'></div>
						</div>
						<div className='flex flex-col gap-2'>
							{dummyPositions.supplied.map((position, index) => (
								<div key={index} className='flex w-full glassmorphic-card p-2'>
									<div className='w-[40%]'>
										<div className='flex items-center gap-2'>
											<Image src={`/images/tokens/${position.asset}.png`} alt={position.asset} width={28} height={28} />
											<div className='flex flex-col'>
												<Typography variant='base' className='font-bakbak'>
													{position.asset}
												</Typography>
											</div>
										</div>
									</div>
									<div className='flex-1 text-right px-6'>
										<Typography variant='xs'>{position.apy}%</Typography>
									</div>
									<div className='flex-1 text-center px-6'>
										<Typography variant='xs'>{position.amount}</Typography>
										<Typography variant='xs' className='text-baoWhite/60'>
											{position.value}
										</Typography>
									</div>
									<div className='flex-1 text-center px-6'>
										<Typography variant='xs'>
											{Config.lendMarkets[marketName].collateralFactor
												? getDisplayBalance(Config.lendMarkets[marketName].collateralFactor.mul(100), 18, 0) + '%'
												: '-'}
										</Typography>
									</div>
									<div className='w-[30%]'>
										<div className='flex gap-2 justify-end'>
											<Button width={'w-[70px]'}>
												<Typography variant='xs'>Supply</Typography>
											</Button>
											<Button width={'w-[70px]'}>
												<Typography variant='xs'>Withdraw</Typography>
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Borrowed Assets Summary */}
					<div className='flex-1'>
						<Typography variant='lg' className='p-4 text-left font-bakbak'>
							<span className='relative inline-block'>
								<span className='relative z-10'>Borrowed Assets</span>
								<span className='absolute inset-0 bg-baoRed translate-y-0 px-4 -mx-4 py-1 -my-1'></span>
							</span>
						</Typography>
						{/* Headers */}
						<div className='flex w-full px-4 mb-2'>
							<div className='w-[40%]'></div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									APR
								</Typography>
							</div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									Your Borrowed
								</Typography>
							</div>
							<div className='w-[30%]'></div>
						</div>
						<div className='flex flex-col gap-2'>
							{dummyPositions.borrowed.map((position, index) => (
								<div key={index} className='flex w-full glassmorphic-card p-2'>
									<div className='w-[40%]'>
										<div className='flex items-center gap-2'>
											<Image src={`/images/tokens/${position.asset}.png`} alt={position.asset} width={28} height={28} />
											<div className='flex flex-col'>
												<Typography variant='base' className='font-bakbak'>
													{position.asset}
												</Typography>
											</div>
										</div>
									</div>
									<div className='flex-1 text-right px-6'>
										<Typography variant='xs'>-{position.apy}%</Typography>
									</div>
									<div className='flex-1 text-center px-6'>
										<Typography variant='xs'>{position.amount}</Typography>
										<Typography variant='xs' className='text-baoWhite/60'>
											{position.value}
										</Typography>
									</div>
									<div className='w-[30%]'>
										<div className='flex gap-2 justify-end'>
											<Button width={'w-[70px]'}>
												<Typography variant='xs'>Borrow</Typography>
											</Button>
											<Button width={'w-[70px]'}>
												<Typography variant='xs'>Repay</Typography>
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Supply/Borrow Section Box */}
			<div className='glassmorphic-card p-4 border border-baoRed/10 bg-baoRed/[0.15]'>
				<div className='flex w-full gap-8'>
					{/* Left Column - Supply */}
					<div className='flex-1'>
						<Typography variant='lg' className='p-4 text-left font-bakbak'>
							<span className='relative inline-block'>
								<span className='relative z-10'>Supply</span>
								<span className='absolute inset-0 bg-baoRed translate-y-0 px-4 -mx-4 py-1 -my-1'></span>
							</span>
						</Typography>
						{/* Supply Headers */}
						<div className='flex w-full px-4 mb-2'>
							<div className='w-[40%]'></div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									APR
								</Typography>
							</div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									Total Supplied
								</Typography>
							</div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									Max LTV
								</Typography>
							</div>
							<div className='w-[30%]'></div>
						</div>
						<div className='flex flex-col gap-2'>
							{supplyAssets.map(asset => {
								const underlyingApr = defiLlamaAprs.data?.[asset.name] ?? 0
								const assetSupplyRate = supplyRates[asset.marketAddress[chainId]] || BigNumber.from(0)
								const assetBorrowApy = borrowApy[asset.marketAddress[chainId]?.toLowerCase()] || BigNumber.from(0)
								const assetTotalSupply = totalSupplies?.find(supply => supply.address === asset.marketAddress[chainId])
								const assetTotalDebt = totalDebts[asset.marketAddress[chainId]] || BigNumber.from(0)
								const assetPrice = oraclePrices[asset.marketAddress[chainId]] || BigNumber.from(0)

								return (
									<div key={asset.marketAddress[chainId]} className='flex w-full glassmorphic-card p-2'>
										<div className='w-[40%]'>
											<div className='flex items-center gap-2'>
												<Image className='inline-block select-none' src={`${asset.icon}`} alt={asset.name} width={28} height={28} />
												<div className='flex flex-col'>
													<Typography variant='base' className='font-bakbak truncate'>
														{asset.name}
													</Typography>
												</div>
											</div>
										</div>
										<div className='flex-1 text-right px-6'>
											<Tooltipped content={renderAprTooltip(asset, 'supply')} placement='top'>
												<Typography variant='xs'>
													{(underlyingApr + (assetSupplyRate?.gt(0) ? parseFloat(getDisplayBalance(assetSupplyRate, 18, 2)) : 0)).toFixed(
														2,
													) + '%'}
												</Typography>
											</Tooltipped>
										</div>
										<div className='flex-1 text-center px-6'>
											<div>
												<div>{getDisplayBalance(assetTotalSupply?.totalSupply || BigNumber.from(0), asset.underlyingDecimals)}</div>
												<div className='text-sm text-baoWhite/60'>
													$
													{getDisplayBalance(
														(assetTotalSupply?.totalSupply || BigNumber.from(0)).mul(assetPrice).div(BigNumber.from(10).pow(18)),
														asset.underlyingDecimals,
														2,
													)}
												</div>
											</div>
										</div>
										<div className='flex-1 text-center px-6'>
											<Typography variant='xs'>
												{Config.lendMarkets[marketName].collateralFactor
													? getDisplayBalance(Config.lendMarkets[marketName].collateralFactor.mul(100), 18, 0) + '%'
													: '-'}
											</Typography>
										</div>
										<div className='w-[30%]'>
											<div className='flex gap-2 justify-end'>
												<Button width={'w-[70px]'} onClick={() => setShowSupplyModal(true)}>
													<Typography variant='xs'>Supply</Typography>
												</Button>
												<Button width={'w-[70px]'} onClick={() => setShowWithdrawModal(true)}>
													<Typography variant='xs'>Withdraw</Typography>
												</Button>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>

					{/* Right Column - Borrow */}
					<div className='flex-1'>
						<Typography variant='lg' className='p-4 text-left font-bakbak'>
							<span className='relative inline-block'>
								<span className='relative z-10'>Borrow</span>
								<span className='absolute inset-0 bg-baoRed translate-y-0 px-4 -mx-4 py-1 -my-1'></span>
							</span>
						</Typography>
						{/* Borrow Headers */}
						<div className='flex w-full px-4 mb-2'>
							<div className='w-[40%]'></div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									APR
								</Typography>
							</div>
							<div className='flex-1 text-right px-6'>
								<Typography variant='xs' className='text-baoWhite/60 tracking-tighter'>
									Total Borrowed
								</Typography>
							</div>
							<div className='w-[30%]'></div>
						</div>
						<div className='flex flex-col gap-2'>
							{borrowableAssets.map(asset => {
								const underlyingApr = defiLlamaAprs.data?.[asset.name] ?? 0
								const assetSupplyRate = supplyRates[asset.marketAddress[chainId]] || BigNumber.from(0)
								const assetBorrowApy = borrowApy[asset.marketAddress[chainId]?.toLowerCase()] || BigNumber.from(0)
								const assetTotalSupply = totalSupplies?.find(supply => supply.address === asset.marketAddress[chainId])
								const assetTotalDebt = totalDebts[asset.marketAddress[chainId]] || BigNumber.from(0)
								const assetPrice = oraclePrices[asset.marketAddress[chainId]] || BigNumber.from(0)

								return (
									<div key={asset.marketAddress[chainId]} className='flex w-full glassmorphic-card p-2'>
										<div className='w-[25%]'>
											<div className='flex items-center gap-2'>
												<Image className='inline-block select-none' src={`${asset.icon}`} alt={asset.name} width={28} height={28} />
												<div className='flex flex-col'>
													<Typography variant='sm' className='font-bakbak'>
														{asset.name}
													</Typography>
												</div>
											</div>
										</div>
										<div className='flex-1 text-right px-6'>
											<Tooltipped content={renderAprTooltip(asset, 'borrow')} placement='top'>
												<Typography variant='xs'>
													{(underlyingApr + (assetSupplyRate?.gt(0) ? parseFloat(getDisplayBalance(assetSupplyRate, 18, 2)) : 0)).toFixed(
														2,
													) + '%'}
												</Typography>
											</Tooltipped>
										</div>
										<div className='flex-1 text-center px-6'>
											<div>
												<div>{getDisplayBalance(assetTotalSupply?.totalSupply || BigNumber.from(0), asset.underlyingDecimals)}</div>
												<div className='text-sm text-baoWhite/60'>
													$
													{getDisplayBalance(
														(assetTotalSupply?.totalSupply || BigNumber.from(0)).mul(assetPrice).div(BigNumber.from(10).pow(18)),
														asset.underlyingDecimals,
														2,
													)}
												</div>
											</div>
										</div>
										<div className='w-[35%]'>
											<div className='flex gap-2 justify-end'>
												<Button width={'w-[70px]'} onClick={() => setShowSupplyModal(true)}>
													<Typography variant='xs'>Supply</Typography>
												</Button>
												<Button width={'w-[70px]'} onClick={() => setShowWithdrawModal(true)}>
													<Typography variant='xs'>Withdraw</Typography>
												</Button>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export const SupplyListItem: React.FC<SupplyListItemProps> = ({ asset, marketName, supplyBalances, mode }) => {
	const { chainId } = useWeb3React()
	const accountBalances = useAccountBalances(marketName)
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const [showWithdrawModal, setShowWithdrawModal] = useState(false)
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [showRepayModal, setShowRepayModal] = useState(false)

	// Get the account balance for this asset
	const accountBalance = useMemo(() => {
		if (!accountBalances || !asset || !asset.underlyingAddress[chainId]) return null
		return accountBalances.find(({ address }) => address === asset.underlyingAddress[chainId])
	}, [accountBalances, asset, chainId])

	// Get oracle prices for all assets
	const marketAddresses = [asset.marketAddress[chainId]]
	const oraclePrices = useOraclePrice(marketName, marketAddresses)
	const assetPrice = oraclePrices[asset.marketAddress[chainId]] || BigNumber.from(0)

	// Get total supplies and debts
	const totalSupplies = useTotalSupplies(marketName)
	const totalDebts = useTotalDebt(marketName)

	const assetTotalSupply = totalSupplies?.find(supply => supply.address === asset.marketAddress[chainId])
	const assetTotalDebt = totalDebts[asset.marketAddress[chainId]] || BigNumber.from(0)

	// Get APRs
	const supplyRates = useSupplyRate(marketName)
	const assetSupplyRate = supplyRates[asset.marketAddress[chainId]] || BigNumber.from(0)
	const borrowApy = useBorrowApy(marketName)
	const assetBorrowApy = borrowApy[asset.marketAddress[chainId]?.toLowerCase()] || BigNumber.from(0)

	const defiLlamaAprs = useDefiLlamaApr()
	const underlyingApr = defiLlamaAprs.data?.[asset.name] ?? 0

	const renderAprTooltip = (asset: Asset, mode: 'supply' | 'borrow') => {
		if (mode === 'supply') {
			return (
				<div className='flex flex-col gap-1'>
					{underlyingApr > 0 && (
						<div>
							<span className='font-bold'>Underlying APR: </span>
							{underlyingApr.toFixed(2)}%
						</div>
					)}
					<div>
						<span className='font-bold'>Lend APR: </span>
						{assetSupplyRate?.gt(0) ? getDisplayBalance(assetSupplyRate, 18, 2) : '0.00'}%
					</div>
					<div className='border-t border-baoWhite/20 mt-1 pt-1'>
						<span className='font-bold'>Total APR: </span>
						{(underlyingApr + (assetSupplyRate?.gt(0) ? parseFloat(getDisplayBalance(assetSupplyRate, 18, 2)) : 0)).toFixed(2)}%
					</div>
				</div>
			)
		}
		return `Borrow APR: ${assetBorrowApy === null ? '-' : assetBorrowApy?.gt(0) ? getDisplayBalance(assetBorrowApy, 18, 2) : '-'}%`
	}

	return (
		<>
			<div className={'flex w-full justify-between place-items-center gap-5 glassmorphic-card p-2'} key={asset.toString()}>
				{/* Asset Info */}
				<div className='flex items-center gap-2 w-[30%]'>
					<Image className='inline-block select-none' src={`${asset.icon}`} alt={asset.name} width={28} height={28} />
					<div className='flex flex-col'>
						<Typography variant='sm' className='font-bakbak'>
							{asset.name}
						</Typography>
					</div>
				</div>

				{/* APR Info */}
				<div className='flex-1 text-right'>
					<Tooltipped content={renderAprTooltip(asset, 'supply')} placement='top'>
						<Typography variant='xs'>
							{(underlyingApr + (assetSupplyRate?.gt(0) ? parseFloat(getDisplayBalance(assetSupplyRate, 18, 2)) : 0)).toFixed(2) + '%'}
						</Typography>
					</Tooltipped>
				</div>

				{/* Total Supply/Borrow Info */}
				<div className='flex-1 text-right'>
					{mode === 'supply' ? (
						assetTotalSupply ? (
							<div>
								<div>{getDisplayBalance(assetTotalSupply.totalSupply, asset.underlyingDecimals)}</div>
								<div className='text-sm text-baoWhite/60'>
									$
									{getDisplayBalance(
										assetTotalSupply.totalSupply.mul(assetPrice).div(BigNumber.from(10).pow(18)),
										asset.underlyingDecimals,
										2,
									)}
								</div>
							</div>
						) : (
							<Loader />
						)
					) : (
						<div>
							<div>{getDisplayBalance(assetTotalDebt, asset.underlyingDecimals)}</div>
							<div className='text-sm text-baoWhite/60'>
								${getDisplayBalance(assetTotalDebt.mul(assetPrice).div(BigNumber.from(10).pow(18)), asset.underlyingDecimals, 2)}
							</div>
						</div>
					)}
				</div>

				{/* Max LTV */}
				<div className='flex-1 text-right'>
					<Typography variant='xs'>
						{mode === 'supply' && Config.lendMarkets[marketName].collateralFactor
							? getDisplayBalance(Config.lendMarkets[marketName].collateralFactor.mul(100), 18, 0) + '%'
							: '-'}
					</Typography>
				</div>

				{/* Buttons */}
				<div className='flex gap-2 w-[40%] justify-end'>
					{mode === 'supply' ? (
						<>
							<Button width={'w-[70px]'} onClick={() => setShowSupplyModal(true)}>
								<Typography variant='xs'>Supply</Typography>
							</Button>
							<Button width={'w-[70px]'} onClick={() => setShowWithdrawModal(true)}>
								<Typography variant='xs'>Withdraw</Typography>
							</Button>
						</>
					) : (
						<>
							<Button width={'w-[70px]'} onClick={() => setShowBorrowModal(true)}>
								<Typography variant='xs'>Borrow</Typography>
							</Button>
							<Button width={'w-[70px]'} onClick={() => setShowRepayModal(true)}>
								<Typography variant='xs'>Repay</Typography>
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Modals */}
			{mode === 'supply' ? (
				<>
					<SupplyModal
						asset={asset}
						show={showSupplyModal}
						onHide={() => setShowSupplyModal(!showSupplyModal)}
						marketName={marketName}
						fullBalance={accountBalance?.balance || BigNumber.from(0)}
					/>
					<WithdrawModal
						asset={asset}
						show={showWithdrawModal}
						onHide={() => setShowWithdrawModal(!showWithdrawModal)}
						marketName={marketName}
					/>
				</>
			) : (
				<>
					<BorrowModal asset={asset} show={showBorrowModal} onHide={() => setShowBorrowModal(!showBorrowModal)} marketName={marketName} />
					<RepayModal asset={asset} show={showRepayModal} onHide={() => setShowRepayModal(!showRepayModal)} marketName={marketName} />
				</>
			)}
		</>
	)
}

export default SupplyList

type SupplyListItemProps = {
	asset: Asset
	marketName: string
	supplyBalances: Balance[]
	mode: 'supply' | 'borrow'
}

type SupplyListProps = {
	marketName: string
	supplyBalances: Balance[]
}
