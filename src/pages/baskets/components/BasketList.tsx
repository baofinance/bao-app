import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useBasketInfo from '@/hooks/baskets/useBasketInfo'
import { getDisplayBalance } from '@/utils/numberFormat'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

import { isDesktop } from 'react-device-detect'
import { ActiveSupportedBasket } from '../../../bao/lib/types'

const BasketList: React.FC<BasketListProps> = ({ baskets }) => {
	const { chainId } = useWeb3React()

	const ethereumBaskets = useMemo(() => {
		if (!baskets) return []
		return baskets.filter(basket => {
			const basketChainId = Object.keys(basket.basketAddresses).map(Number)[0]
			return basketChainId === 1 // chainId 1 = Ethereum
		})
	}, [baskets])

	const polygonBaskets = useMemo(() => {
		if (!baskets) return []
		return baskets.filter(basket => {
			const basketChainId = Object.keys(basket.basketAddresses).map(Number)[0]
			return basketChainId === 137 // chainId 137 = Polygon
		})
	}, [baskets])

	return (
		<>
			{/* Ethereum Section */}
			<div className='mb-4'>
				<div className='mb-2 flex items-center gap-2'>
					<Image src='/images/tokens/ETH.png' alt='Ethereum' width={24} height={24} className='inline-block' />
					<Typography variant='h3' className='font-bakbak'>
						Ethereum
					</Typography>
				</div>
				<ListHeader headers={isDesktop ? ['Basket Name', 'Supply'] : ['Name', 'Supply']} />
				<div className='flex flex-col gap-4'>
					{ethereumBaskets.length > 0 ? (
						ethereumBaskets.map(basket => <BasketListItem basket={basket} key={basket.nid} />)
					) : (
						<div className='glassmorphic-card px-4 py-8 text-center'>
							<Typography variant='sm' className='text-baoWhite/60'>
								No baskets available
							</Typography>
						</div>
					)}
				</div>
			</div>

			{/* Polygon Section */}
			<div className='mb-4'>
				<div className='mb-2 flex items-center gap-2'>
					<Image src='/images/tokens/MATIC.png' alt='Polygon' width={24} height={24} className='inline-block' />
					<Typography variant='h3' className='font-bakbak'>
						Polygon
					</Typography>
				</div>
				<ListHeader headers={isDesktop ? ['Basket Name', 'Supply'] : ['Name', 'Supply']} />
				<div className='flex flex-col gap-4'>
					{polygonBaskets.length > 0 ? (
						polygonBaskets.map(basket => <BasketListItem basket={basket} key={basket.nid} />)
					) : (
						<div className='glassmorphic-card px-4 py-8 text-center'>
							<Typography variant='sm' className='text-baoWhite/60'>
								No baskets available
							</Typography>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

const BasketListItem: React.FC<BasketListItemProps> = ({ basket }) => {
	const info = useBasketInfo(basket)

	return (
		<Link href={`/baskets/${basket.symbol}`} key={basket.nid}>
			<div className='glassmorphic-card w-full px-4 py-2 duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20 cursor-pointer'>
				<div className='flex w-full flex-row'>
					<div className='flex w-full'>
						<div className='my-auto flex place-items-center'>
							<Image
								src={basket.icon.startsWith('/') ? basket.icon : `/images/tokens/${basket.icon}`}
								alt={basket.symbol}
								className={`inline-block`}
								height={32}
								width={32}
							/>
							<span className='inline-block text-left align-middle'>
								<Typography variant='lg' className='ml-2 font-bakbak'>
									{basket.symbol}
								</Typography>
								<Typography variant='sm' className='ml-2 hidden text-baoWhite lg:block'>
									{basket.desc}
								</Typography>
							</span>
						</div>
					</div>

					<div className='mx-auto my-0 flex w-full flex-col items-end justify-center text-right'>
						<span className='inline-block'>
							{info ? (
								<>
									<Typography className='m-0 font-bakbak text-lg leading-5'>{getDisplayBalance(info.totalSupply)}</Typography>
								</>
							) : (
								<Loader />
							)}
						</span>
					</div>
				</div>
			</div>
		</Link>
	)
}

type BasketListProps = {
	baskets: ActiveSupportedBasket[]
}

type BasketListItemProps = {
	basket: ActiveSupportedBasket
}

export default BasketList
