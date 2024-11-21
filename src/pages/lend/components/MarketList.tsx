import { ListHeader } from '@/components/List'
import Loader, { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import Tooltipped from '@/components/Tooltipped'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/future/image'
import Link from 'next/link'
import Config from '@/bao/lib/config'
import React from 'react'

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
	const { account } = useWeb3React()
	const market = Config.lendMarkets[marketName]

	// Filter active and supply-enabled assets
	const collateral = market.assets.filter(asset => asset.supply && asset.active)

	// Group assets by their `group` property (or fallback to `name`)
	const groupedCollateral = Object.values(
		collateral.reduce((groups, asset) => {
			const groupName = asset.group || asset.name
			if (!groups[groupName]) {
				groups[groupName] = {
					icon: asset.icon,
					groupName,
				}
			}
			return groups
		}, {} as Record<string, { icon: string; groupName: string }>)
	)

	return (
		market && (
			<Link href={account ? `/lend/${market.name}` : `#`} key={market.name}>
				<button className='glassmorphic-card w-full px-4 py-2 duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'>
					<div className='flex w-full flex-row'>
						<div className='flex w-full'>
							<div className='my-auto'>
								{/* Market Name and Description */}
								<Image src={market.assets[0]?.icon || ''} alt={market.name} className={`inline-block`} height={38} width={38} />
								<span className='inline-block text-left align-middle'>
									<Typography variant='lg' className='ml-2 font-bakbak'>
										{market.name}
									</Typography>
									<Typography variant='sm' className={`ml-2 text-baoWhite`}>
										{market.desc}
									</Typography>
								</span>
							</div>
						</div>
					</div>

					{/* Collateral Display */}
					<div className='mx-auto my-2 flex w-full items-center justify-center'>
						{groupedCollateral.length > 0 ? (
							groupedCollateral.map(asset => (
								<Tooltipped content={asset.groupName} key={asset.groupName} placement='bottom'>
									<span className={`-ml-2 inline-block select-none duration-200 first:ml-0`}>
										<Image
											src={asset.icon}
											alt={asset.groupName}
											className={`inline-block`}
											height={32}
											width={32}
										/>
									</span>
								</Tooltipped>
							))
						) : (
							<Loader />
						)}
					</div>
				</button>
			</Link>
		)
	)
}

export default MarketList

type MarketListProps = {
	marketName: string
}
