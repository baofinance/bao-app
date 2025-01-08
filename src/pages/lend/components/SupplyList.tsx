import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useEffect, useState, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Balance } from '@/bao/lib/types'
import { formatTokenAmount } from '@/utils/formatNumbers'
import { useSupplyRate } from '@/hooks/lend/useSupplyRate'
import { useCollateralFactor } from '@/hooks/lend/useCollateralFactor'
import { useBorrowRate } from '@/hooks/lend/useBorrowRate'
import { usePrice } from '@/hooks/lend/usePrice'
import { useExchangeRates } from '@/hooks/lend/useExchangeRate'
import { useTotalSupply } from '@/hooks/lend/useTotalSupply'
import { useTotalSupplies } from '@/hooks/lend/useTotalSupplies'
import { useTotalBorrow } from '@/hooks/lend/useTotalBorrow'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { formatUnits } from 'ethers/lib/utils'
import { useInterestRateModel } from '@/hooks/lend/useInterestRateModel'
import { InterestRateChart } from '@/components/InterestRateChart'
import { Tooltip } from '@/components/Tooltip'

interface SupplyListProps {
	marketName: string
	supplyBalances: Balance[]
	totalSupply: string
	market: {
		assets: Array<{
			name: string
			icon: string
			llamaId?: string
			ctokenAddress: { [key: number]: string }
			underlyingAddress: { [key: number]: string }
			underlyingDecimals: number
			supply?: boolean
			borrow?: boolean
		}>
	}
}

const SupplyList: React.FC<SupplyListProps> = ({ marketName, supplyBalances, totalSupply, market }) => {
	return (
		<div className='rounded-lg border border-gray-800'>
			<div className='grid grid-cols-6 gap-4 px-4 py-2 border-b border-gray-800'>
				<div className='text-gray-400'></div>
				<div className='text-gray-400'>Supplied</div>
				<div className='text-gray-400 text-center'>APY</div>
				<div className='text-gray-400 text-center'>Max LTV</div>
				<div className='text-gray-400'>Borrowed</div>
				<div className='text-gray-400 text-center'>Borrow APR</div>
			</div>
			<div className='flex flex-col'>
				{market.assets.map(asset => (
					<SupplyListItem key={asset.name} asset={asset} marketName={marketName} supplyBalances={supplyBalances} />
				))}
			</div>
		</div>
	)
}

const SupplyListItem: React.FC<{
	asset: {
		name: string
		icon: string
		llamaId?: string
		ctokenAddress: { [key: number]: string }
		underlyingAddress: { [key: number]: string }
		underlyingDecimals: number
		supply?: boolean
		borrow?: boolean
	}
	marketName: string
	supplyBalances: Balance[]
}> = ({ asset, marketName, supplyBalances }) => {
	const { chainId = 1 } = useWeb3React()

	// Get market data
	const totalSupplies = useTotalSupplies(marketName)
	const price = usePrice(marketName, asset.ctokenAddress)
	const supplyRate = useSupplyRate(marketName, asset.ctokenAddress, asset.llamaId)
	const collateralFactor = useCollateralFactor(marketName, asset.ctokenAddress)
	const borrowRate = useBorrowRate(marketName, asset.ctokenAddress)

	// Get total borrow data instead of user balances
	const totalBorrow = useTotalBorrow(marketName, asset.ctokenAddress)
	const borrowApys = useBorrowApy(marketName)

	// Find this asset's supply data
	const assetSupply = useMemo(() => {
		if (!totalSupplies || !asset.ctokenAddress[chainId]) return null
		return totalSupplies.find(supply => supply.address.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())
	}, [totalSupplies, asset.ctokenAddress, chainId])

	// Format supply amount
	const formattedSupply = useMemo(() => {
		if (!assetSupply?.totalSupply) return '0'
		return formatUnits(assetSupply.totalSupply, asset.underlyingDecimals)
	}, [assetSupply, asset.underlyingDecimals])

	// Calculate USD value
	const suppliedUSD = useMemo(() => {
		if (!formattedSupply || !price) return '0.00'
		return (Number(formattedSupply) * Number(price)).toFixed(2)
	}, [formattedSupply, price])

	// Calculate borrowed USD value
	const borrowedUSD = useMemo(() => {
		if (!totalBorrow || !price) return '0.00'
		return (Number(totalBorrow) * Number(price)).toFixed(2)
	}, [totalBorrow, price])

	// Get borrow APY
	const borrowApy = useMemo(() => {
		if (!borrowApys || !asset.underlyingAddress[chainId]) return 0
		return borrowApys[asset.underlyingAddress[chainId]] || 0
	}, [borrowApys, asset.underlyingAddress, chainId])

	const modelParams = useInterestRateModel(asset.ctokenAddress)

	return (
		<div className='grid grid-cols-6 gap-4 px-4 py-2 hover:bg-baoRed/10'>
			{/* Asset Name/Logo - Left aligned */}
			<div className='flex items-center gap-2'>
				<Image src={asset.icon} alt={asset.name} className='rounded-full' height={32} width={32} />
				<div>
					<Typography variant='lg'>{asset.name}</Typography>
					{asset.supply && !asset.borrow && (
						<Typography variant='sm' className='text-baoWhite/60 border border-baoWhite/20 px-2 py-0.5 rounded text-xs'>
							Collateral Only
						</Typography>
					)}
				</div>
			</div>

			{/* Supplied Amount - Left aligned */}
			<div className='flex flex-col'>
				<Typography variant='lg'>{formattedSupply ? formatTokenAmount(formattedSupply, 4) : <Loader />}</Typography>
				<Typography variant='sm' className='text-gray-400'>
					${suppliedUSD}
				</Typography>
			</div>

			{/* APY - Center aligned */}
			<div className='flex flex-col items-center'>
				<Typography variant='lg'>
					{supplyRate ? (
						Number(supplyRate.totalApy) === 0 ? (
							'0%'
						) : Number(supplyRate.totalApy) < 0.01 ? (
							'<0.01%'
						) : (
							`${Number(supplyRate.totalApy).toFixed(2)}%`
						)
					) : (
						<Loader />
					)}
				</Typography>
				{asset.llamaId && supplyRate?.underlyingApy && Number(supplyRate.underlyingApy) > 0 && (
					<Typography variant='sm' className='text-gray-400'>
						+{Number(supplyRate.underlyingApy).toFixed(2)}% underlying
					</Typography>
				)}
			</div>

			{/* Max LTV - Center aligned */}
			<div className='flex items-center justify-center'>
				<Typography variant='lg'>{collateralFactor ? Math.round(Number(collateralFactor) * 100) + '%' : <Loader />}</Typography>
			</div>

			{/* Borrowed Amount - Left aligned */}
			<div className='flex flex-col'>
				{asset.supply && !asset.borrow ? (
					<Typography variant='lg'>-</Typography>
				) : (
					<>
						<Typography variant='lg'>{totalBorrow ? formatTokenAmount(totalBorrow, 4) : <Loader />}</Typography>
						<Typography variant='sm' className='text-gray-400'>
							${borrowedUSD}
						</Typography>
					</>
				)}
			</div>

			{/* Borrow APR - Center aligned */}
			<div className='flex items-center justify-center'>
				<Tooltip content={modelParams ? <InterestRateChart {...modelParams} /> : 'Loading interest rate model...'}>
					<Typography variant='lg'>{asset.borrow ? borrowApy ? `${borrowApy.toFixed(2)}%` : <Loader /> : '-'}</Typography>
				</Tooltip>
			</div>
		</div>
	)
}

export default SupplyList
