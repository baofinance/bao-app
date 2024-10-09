import { ListHeader } from '@/components/List'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/future/image'
import Link from 'next/link'
import Config from '@/bao/lib/config'
import React from 'react'

export const MarketList: React.FC = () => {
	const markets = Config.lendMarkets

	return (
		<>
			<ListHeader headers={['Market', 'Assets']} />
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

	return (
		market && (
			<Link href={account ? `/lend/${market.name}` : `#`} key={market.name}>
				<button className='glassmorphic-card w-full px-4 py-2 duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'>
					<div className='flex w-full flex-row'>
						<div className='flex w-full'>
							<div className='my-auto'>
								<Image src={`/images/tokens/${market.name}.png`} alt={market.name} className={`inline-block`} height={38} width={38} />
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
				</button>
			</Link>
		)
	)
}

export default MarketList

type MarketListProps = {
	marketName: string
}
