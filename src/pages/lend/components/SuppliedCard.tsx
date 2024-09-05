import Card from '@/components/Card/Card'
import Typography from '@/components/Typography'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'
import Config from '@/bao/lib/config'
import { Asset, Balance } from '@/bao/lib/types'
import { getDisplayBalance } from '@/utils/numberFormat'
import Image from 'next/future/image'
import Loader from '@/components/Loader'
import { BigNumber } from 'ethers'

export const SuppliedCard = ({ marketName, onUpdate }: { marketName: string; onUpdate: (updatedState: any) => void }) => {
	const { account, chainId } = useWeb3React()
	const assets = Config.lendMarkets[marketName].assets
	const suppliedBalances = useSupplyBalances(marketName)
	const [supplied, setSupplied] = useState<Asset[]>([])

	useEffect(() => {
		if (suppliedBalances) {
			const suppliedAddresses = suppliedBalances.filter(balance => balance.balance.gt(BigNumber.from(0))).map(balance => balance.address)
			setSupplied(assets.filter(asset => asset.supply === true && suppliedAddresses.includes(asset.underlyingAddress[chainId])))
		}
	}, [suppliedBalances])

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Supplied
			</Typography>
			<Card className='glassmorphic-card'>
				{supplied && supplied.length > 0 ? (
					supplied.map(asset => (
						<SuppliedListItem asset={asset} key={asset.id} suppliedBalances={suppliedBalances} marketName={marketName} />
					))
				) : (
					<Typography variant='xl' className='p-4 text-center font-bakbak'>
						{suppliedBalances ? 'No assets supplied' : <Loader />}
					</Typography>
				)}
			</Card>
		</>
	)
}

const SuppliedListItem: React.FC<SuppliedListItemProps> = ({ asset, suppliedBalances, marketName }) => {
	const { chainId } = useWeb3React()
	const [formattedBalance, setFormattedBalance] = useState(null)
	const [balance, setBalance] = useState(null)
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const [showBorrowModal, setShowBorrowModal] = useState(false)

	function fetchBalance(asset: Asset) {
		if (suppliedBalances !== null && suppliedBalances !== undefined)
			return suppliedBalances.find(({ address }) => address === asset.underlyingAddress[chainId])
	}

	useEffect(() => {
		const balance = fetchBalance(asset)
		if (balance !== null && balance !== undefined) {
			setBalance(balance)
			setFormattedBalance(getDisplayBalance(balance.balance, balance.decimals))
		}
	}, [suppliedBalances])

	return (
		<>
			<div className='flex w-full'>
				<div className='flex w-full justify-between place-items-center gap-5'>
					<div
						key={asset.name}
						className='text-baoWhite flex overflow-hidden rounded-2xl bg-baoBlack shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none select-none border-baoBlack px-2 py-3 text-sm'
					>
						<div className='mx-0 my-auto flex h-full left gap-4 w-[180px]'>
							<div>
								<Image className='z-10 inline-block select-none' src={asset.icon} alt={asset.name} width={24} height={24} />
								<span className='ml-2 inline-block text-left align-middle'>
									<Typography variant='lg' className='font-bakbak'>
										{asset.name}
									</Typography>
								</span>
							</div>
						</div>
					</div>
					<div>{formattedBalance ? formattedBalance : <Loader />}</div>
				</div>
			</div>
		</>
	)
}

type SuppliedListItemProps = {
	asset: Asset
	suppliedBalances: Balance[]
	marketName: string
}

export default SuppliedCard
