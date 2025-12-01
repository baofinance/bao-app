import Badge from '@/components/Badge'
import Typography from '@/components/Typography'
import useBasketInfo from '@/hooks/baskets/useBasketInfo'
import useBasketRates from '@/hooks/baskets/useBasketRate'
import useBaskets from '@/hooks/baskets/useBaskets'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import { useMemo } from 'react'
import Loader from '../../components/Loader'
import BasketButtons from './components/BasketButtons'

export async function getStaticPaths() {
	return {
		paths: [{ params: { basket: 'bSTBL' } }, { params: { basket: 'nDEFI' } }],
		fallback: false, // can also be true or 'blocking'
	}
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps({ params }: { params: any }) {
	const { basket } = params

	return {
		props: {
			basketId: basket,
		},
	}
}

const Basket: NextPage<{
	basketId: string
}> = ({ basketId }) => {
	const baskets = useBaskets()

	const basket = useMemo(() => {
		if (!baskets) return
		return baskets.find(basket => basket.symbol === basketId)
	}, [basketId, baskets])

	const rates = useBasketRates(basket)
	const info = useBasketInfo(basket)

	return basket ? (
		<>
			<NextSeo title={`${basketId} Basket`} description={`Mint or Redeem ${basketId}`} />
			<div className='mb-4 flex w-full flex-row items-center gap-4 rounded border-0 align-middle'>
				<Link href='/baskets'>
					<div className='glassmorphic-card flex h-fit w-fit flex-row items-center p-4 align-middle duration-200 hover:bg-baoRed lg:p-7'>
						<FontAwesomeIcon icon={faArrowLeft} size='lg' />
					</div>
				</Link>
				{/*Desktop*/}
				<div className='glassmorphic-card hidden w-full !px-8 !py-4 lg:grid lg:grid-cols-4'>
					<div className='col-span-1 mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
						<Image
							src={`/images/tokens/${basket.icon}`}
							alt={`${basket.symbol}`}
							width={40}
							height={40}
							className='inline-block select-none'
						/>
						<span className='inline-block text-left align-middle'>
							<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
								{basket.symbol}
							</Typography>
							{rates && rates.usd.gt(0) && (
								<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(rates.usd)}</Badge>
							)}
						</span>
					</div>
					<div className='col-span-3 mx-auto my-0 flex w-full flex-row items-center justify-end align-middle'>
						<div className='grid grid-cols-1 gap-16'>
							<div className='col-span-1 break-words text-center'>
								<Typography variant='base' className='font-bakbak text-baoRed'>
									Supply
								</Typography>
								<Typography variant='xl' className='inline-block font-bakbak leading-5'>
									{info ? `${getDisplayBalance(info.totalSupply)}` : <Loader />}
								</Typography>
							</div>
						</div>
					</div>
				</div>
				{/*Mobile*/}
				<div className='w-full lg:hidden'>
					<div className='my-0 flex w-full flex-row items-center justify-end align-middle'>
						<Image
							src={`/images/tokens/${basket.icon}`}
							alt={`${basket.symbol}`}
							width={40}
							height={40}
							className='inline-block select-none'
						/>
						<span className='inline-block text-left align-middle'>
							<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
								{basket.symbol}
							</Typography>
							{rates && rates.usd.gt(0) && (
								<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(rates.usd)}</Badge>
							)}
						</span>
					</div>
				</div>
			</div>
			<div className='glassmorphic-card grid grid-cols-1 !rounded-3xl lg:hidden'>
				<div className='col-span-1 break-words px-2 py-2 text-center'>
					<Typography variant='sm' className='font-bakbak text-baoRed'>
						Supply
					</Typography>
					<Typography variant='base' className='inline-block font-bakbak leading-5'>
						{info ? `${getDisplayBalance(info.totalSupply)}` : <Loader />}
					</Typography>
				</div>
			</div>
			<Typography variant='base' className='text-baoRed font-bakbak leading-5 my-2'>
				NOTICE: Baskets are in sunset. We will be discontinuing them and so minting is disabled.
			</Typography>
			<BasketButtons basket={basket} swapLink={basket.swap} />
		</>
	) : (
		<Loader />
	)
}

export default Basket
