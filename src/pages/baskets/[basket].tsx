import Badge from '@/components/Badge'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBasketInfo from '@/hooks/baskets/useBasketInfo'
import useBasketRates from '@/hooks/baskets/useBasketRate'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import useNav from '@/hooks/baskets/useNav'
import usePairPrice from '@/hooks/baskets/usePairPrice'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import { useMemo } from 'react'
import Loader from '../../components/Loader'
import BasketButtons from './components/BasketButtons'
import Composition from './components/Composition'
import Description from './components/Description'
//import { formatUnits, parseUnits } from 'ethers/lib/utils'

export async function getStaticPaths() {
	return {
		paths: [{ params: { basket: 'bSTBL' } }, { params: { basket: 'bETH' } }],
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

	const composition = useComposition(basket)
	const rates = useBasketRates(basket)
	const info = useBasketInfo(basket)
	const pairPrice = usePairPrice(basket)

	const nav = useNav(composition, info ? info.totalSupply : BigNumber.from(1))

	let premium = null
	// let premiumColor = 'white'
	if (nav && pairPrice && rates) {
		premium =
			((parseFloat(nav.toString()) - parseFloat(formatUnits(rates.usd.toString()))) / parseFloat(formatUnits(rates.usd.toString()))) * 100
		// premiumColor = premium < 0 ? 'red' : 'green'
	}

	let marketCap
	if (rates && info) {
		marketCap = decimate(rates.usd.mul(info.totalSupply))
	}

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
							<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(rates ? rates.usd : BigNumber.from(0))}</Badge>
						</span>
					</div>
					<div className='col-span-3 mx-auto my-0 flex w-full flex-row items-center justify-end align-middle'>
						<div className='grid grid-cols-4 gap-16'>
							<div className='col-span-1 break-words text-center'>
								<Typography variant='base' className='font-bakbak text-baoRed'>
									Market Cap
								</Typography>
								<Typography variant='xl' className='inline-block font-bakbak leading-5'>
									{marketCap ? `$${getDisplayBalance(marketCap)}` : <Loader />}
								</Typography>
							</div>
							<div className='col-span-1 break-words text-center'>
								<Typography variant='base' className='font-bakbak text-baoRed'>
									Supply
								</Typography>
								<Typography variant='xl' className='inline-block font-bakbak leading-5'>
									{info ? `${getDisplayBalance(info.totalSupply)}` : <Loader />}
								</Typography>
							</div>
							<div className='col-span-1 break-words text-center'>
								<Typography variant='base' className='font-bakbak text-baoRed'>
									NAV{' '}
									<Tooltipped
										content={`The Net Asset Value is the value of one ${
											basket && basket.symbol
										} token if you were to own each underlying asset with identical weighting to the basket.`}
										placement='top'
									/>
								</Typography>
								<Typography variant='xl' className='inline-block font-bakbak leading-5'>
									{nav ? `$${parseFloat(nav.toString()).toFixed(2)}` : <Loader />}
								</Typography>
							</div>
							<div className='col-span-1 break-words text-center'>
								<Typography variant='base' className='font-bakbak text-baoRed'>
									Premium{' '}
									<Tooltipped
										content={`Percent difference between the price on exchange 
							and the price to mint.`}
									/>
								</Typography>
								<Typography variant='xl' className='inline-block font-bakbak leading-5'>
									{premium ? `${premium.toFixed(4)}%` : <Loader />}
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
							<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(rates ? rates.usd : BigNumber.from(0))}</Badge>
						</span>
					</div>
				</div>
			</div>
			<div className='glassmorphic-card grid grid-cols-3 !rounded-3xl lg:hidden'>
				<div className='col-span-1 break-words px-2 py-2 text-center'>
					<Typography variant='sm' className='font-bakbak text-baoRed'>
						Market Cap
					</Typography>
					<Typography variant='base' className='inline-block font-bakbak leading-5'>
						{marketCap ? `$${getDisplayBalance(marketCap)}` : <Loader />}
					</Typography>
				</div>
				<div className='col-span-1 break-words px-2 py-2 text-center'>
					<Typography variant='sm' className='font-bakbak text-baoRed'>
						NAV{' '}
						<Tooltipped
							content={`The Net Asset Value is the value of one ${
								basket && basket.symbol
							} token if you were to own each underlying asset with identical weighting to the basket.`}
							placement='top'
						/>
					</Typography>
					<Typography variant='base' className='inline-block font-bakbak leading-5'>
						{nav ? `$${parseFloat(nav.toString()).toFixed(2)}` : <Loader />}
					</Typography>
				</div>
				<div className='col-span-1 break-words px-2 py-2 text-center'>
					<Typography variant='sm' className='font-bakbak text-baoRed'>
						Premium{' '}
						<Tooltipped
							content={`Percent difference between the price on exchange 
							and the price to mint.`}
						/>
					</Typography>
					<Typography variant='base' className='inline-block font-bakbak leading-5'>
						{premium ? `${premium.toFixed(4)}%` : <Loader />}
					</Typography>
				</div>
			</div>

			<Composition composition={composition} rates={rates} info={info} basketId={basketId} />
			<Typography variant='base' className='text-baoRed font-bakbak leading-5 my-2'>
				NOTICE: Baskets are in sunset. We will be discontinuing them and so minting is disabled.
			</Typography>
			<BasketButtons basket={basket} swapLink={basket.swap} />
			<Description basketAddress={basket.basketAddresses[1]} />
		</>
	) : (
		<Loader />
	)
}

export default Basket
