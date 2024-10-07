import React from 'react'
import Image from 'next/future/image'
import { isDesktop } from 'react-device-detect'

import Typography from '@/components/Typography'
import { getDisplayBalance } from '@/utils/numberFormat'
import useAuraPool from '@/hooks/earn/useAuraPool'

interface FarmData {
	id: string
	name: string
	tokens: string[]
	link: string
}

const farms: FarmData[] = [
	{ id: '93', name: 'baoUSD-LUSD', tokens: ['baoUSD', 'LUSD'], link: 'https://app.aura.finance/#/1/pool/93' },
	{ id: '132', name: 'baoETH-ETH', tokens: ['baoETH', 'ETH'], link: 'https://app.aura.finance/#/1/pool/132' },
	{ id: '215', name: 'baoUSD-LUSD/Bao (20/80 Pool)', tokens: ['baoUSD', 'LUSD', 'BAO'], link: 'https://app.aura.finance/#/1/pool/215' },
	{ id: '216', name: 'baoETH-ETH/Bao (20/80 Pool)', tokens: ['baoETH', 'ETH', 'BAO'], link: 'https://app.aura.finance/#/1/pool/216' },
	{ id: '218', name: 'baoUSD-sDAI', tokens: ['baoUSD', 'SDAI'], link: 'https://app.aura.finance/#/1/pool/218' },
	{ id: '217', name: 'baoETH-wstETH', tokens: ['baoETH', 'wstETH'], link: 'https://app.aura.finance/#/1/pool/217' },
	{ id: '219', name: 'baoETH-rETH', tokens: ['baoETH', 'rETH'], link: 'https://app.aura.finance/#/1/pool/219' },
	{ id: '224', name: 'baoUSD-sUSDe', tokens: ['baoUSD', 'sUSDe'], link: 'https://app.aura.finance/#/1/pool/224' },
]

const FarmRow: React.FC<{ farm: FarmData }> = ({ farm }) => {
	const poolData = useAuraPool(farm.id)

	return (
		<a
			className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
			href={farm.link}
		>
			<div className='flex w-full flex-row'>
				<div className='flex basis-1/4 lg:basis-2/5'>
					<div className='mx-0 my-auto inline-block h-full items-center'>
						<div className='mr-2 hidden lg:inline-block'>
							{farm.tokens.map((token, index) => (
								<Image
									key={token}
									className={`${index > 0 ? 'z-20 -ml-2' : 'z-10'} inline-block select-none`}
									src={`/images/tokens/${token}.png`}
									alt={token}
									width={24}
									height={24}
								/>
							))}
						</div>
						<span className='inline-block text-left align-middle'>
							<Typography variant='base' className='font-bakbak'>
								{farm.name}
							</Typography>
						</span>
					</div>
				</div>

				<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
					<div className='mx-0 my-auto inline-block h-full items-center'>
						<div className='mr-2 hidden lg:inline-block'>
							<Image src='/images/platforms/Aura.webp' height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
						</div>
						<span className='inline-block text-left align-middle'>
							<Typography variant='base' className='font-bakbak'>
								Aura
							</Typography>
						</span>
					</div>
				</div>

				<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
					<Typography variant='base' className='ml-2 inline-block font-bakbak'>
						{getDisplayBalance(poolData?.apr ?? 0, 0)}%
					</Typography>
				</div>

				<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
					<Typography variant='base' className='ml-2 inline-block font-bakbak'>
						${getDisplayBalance(poolData?.tvl ?? 0, 0)}
					</Typography>
				</div>
			</div>
		</a>
	)
}

const ExternalFarms: React.FC = () => {
	return (
		<>
			<div className='flex w-full flex-row px-2 py-3'>
				<Typography className='flex w-full basis-1/4 flex-col items-center px-4 pb-0 text-center font-bakbak text-base first:items-start last:items-end lg:basis-2/5 lg:text-lg'>
					{isDesktop && 'Farm'} Name
				</Typography>
				<Typography className='hidden w-full basis-1/4 flex-col items-center px-4 pb-0 text-center font-bakbak text-base first:items-start last:items-end lg:flex lg:basis-1/5 lg:text-lg'>
					Protocol
				</Typography>
				<Typography className='flex w-full basis-1/4 flex-col items-center px-4 pb-0 text-center font-bakbak text-base first:items-start last:items-end lg:basis-1/5 lg:text-lg'>
					APR
				</Typography>
				<Typography className='flex w-full basis-1/4 flex-col items-center px-4 pb-0 text-center font-bakbak text-base first:items-start last:items-end lg:basis-1/5 lg:text-lg'>
					TVL
				</Typography>
			</div>
			<div className='flex flex-col gap-4'>
				{farms.map(farm => (
					<FarmRow key={farm.id} farm={farm} />
				))}
			</div>
		</>
	)
}

export default ExternalFarms
