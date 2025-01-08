import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Typography from '@/components/Typography'
import { SupplyList } from './components/SupplyList'
import { BorrowList } from './components/BorrowList'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'
import Config from '@/bao/lib/config'
import Image from 'next/future/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const MarketPage: NextPage = () => {
	const router = useRouter()
	const { market: marketName } = router.query
	const market = marketName ? Config.vaults[marketName as string] : null
	const supplyBalances = useAccountBalances(marketName as string)

	if (!market) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<Typography variant='h1'>Market not found</Typography>
			</div>
		)
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='mb-8'>
				<Link href='/lend'>
					<div className='flex items-center space-x-2 text-baoWhite/60 hover:text-baoWhite cursor-pointer'>
						<FontAwesomeIcon icon={faArrowLeft} className='w-4 h-4' />
						<Typography variant='sm'>Back to Markets</Typography>
					</div>
				</Link>
			</div>

			<div className='flex items-center space-x-4 mb-8'>
				<div className='w-16 h-16 rounded-full bg-baoBlack/60 border border-baoWhite/10 overflow-hidden'>
					<Image src={`/images/tokens/${marketName}.png`} alt={market.name} width={64} height={64} />
				</div>
				<div>
					<div className='flex items-center space-x-2'>
						<Typography variant='h1'>{market.name}</Typography>
						<div
							className={`px-2 py-1 rounded text-sm ${
								market.type === 'core market' ? 'bg-baoRed text-white' : 'bg-baoBlack/60 text-baoWhite/60'
							}`}
						>
							{market.type === 'core market' ? 'Core' : 'Insured'}
						</div>
					</div>
					<Typography variant='lg' className='text-baoWhite/60'>
						{market.desc}
					</Typography>
				</div>
			</div>

			<div className='flex flex-col gap-8'>
				<SupplyList marketName={marketName as string} supplyBalances={supplyBalances} />
				<BorrowList marketName={marketName as string} />
			</div>
		</div>
	)
}

export default MarketPage
