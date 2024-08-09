import Typography from '@/components/Typography'
import { getDisplayBalance } from '@/utils/numberFormat'
import Image from 'next/future/image'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import useAuraPool from '@/hooks/earn/useAuraPool'

const ExternalFarms: React.FC = () => {
	const baoUsdLusdPool = useAuraPool('93')
	const baoEthEthPool = useAuraPool('132')
	const baoUsdLusd20Bao80Pool = useAuraPool('215')
	const baoEthEth20Bao80Pool = useAuraPool('216')
	const baoUsdsDAIPool = useAuraPool('218')
	const baoEthwstEthPool = useAuraPool('217')
	const baoEthrEthPool = useAuraPool('219')
	const baoUsdsUSDePool = useAuraPool('224')

	return (
		<>
			<div className={`flex w-full flex-row px-2 py-3`}>
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
				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/93'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoUSD.png' alt='baoUSD' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/LUSD.png' alt='LUSD' width={24} height={24} />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoUSD-LUSD
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoUsdLusdPool ? baoUsdLusdPool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoUsdLusdPool ? baoUsdLusdPool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>

				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/132'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoETH.png' alt='baoETH' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/ETH.png' alt='ETH' width={24} height={24} />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoETH-ETH
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoEthEthPool ? baoEthEthPool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoEthEthPool ? baoEthEthPool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>

				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/215'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoUSD.png' alt='baoUSD' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/LUSD.png' alt='LUSD' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/BAO.png' alt='BAO' width={24} height={24} />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoUSD-LUSD/Bao (20/80 Pool)
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoUsdLusd20Bao80Pool ? baoUsdLusd20Bao80Pool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoUsdLusd20Bao80Pool ? baoUsdLusd20Bao80Pool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>

				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/216'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoETH.png' alt='baoETH' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/ETH.png' alt='ETH' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/BAO.png' alt='BAO' width={24} height={24} />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoETH-ETH/Bao (20/80 Pool)
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoEthEth20Bao80Pool ? baoEthEth20Bao80Pool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoEthEth20Bao80Pool ? baoEthEth20Bao80Pool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>

				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/218'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoUSD.png' alt='baoUSD' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/SDAI.png' alt='sDAI' width={24} height={24} />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoUSD-sDAI
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoUsdsDAIPool ? baoUsdsDAIPool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoUsdsDAIPool ? baoUsdsDAIPool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>

				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/217'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoETH.png' alt='baoETH' width={24} height={24} />
									<Image
										className='z-20 -ml-2 inline-block select-none'
										src='/images/tokens/wstETH.png'
										alt='wstETH'
										width={24}
										height={24}
									/>
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoETH-wstETH
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoEthwstEthPool ? baoEthwstEthPool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoEthwstEthPool ? baoEthwstEthPool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>

				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/219'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoETH.png' alt='baoETH' width={24} height={24} />
									<Image className='z-20 -ml-2 inline-block select-none' src='/images/tokens/rETH.png' alt='rETH' width={24} height={24} />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoETH-rETH
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoEthrEthPool ? baoEthrEthPool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoEthrEthPool ? baoEthrEthPool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>

				<a
					className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
					href='https://app.aura.finance/#/1/pool/224'
				>
					<div className='flex w-full flex-row'>
						<div className='flex basis-1/4 lg:basis-2/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image className='z-10 inline-block select-none' src='/images/tokens/baoUSD.png' alt='baoETH' width={24} height={24} />
									<Image
										className='z-20 -ml-2 inline-block select-none'
										src='/images/tokens/sUSDe.png'
										alt='sUSDe'
										width={24}
										height={24}
									/>
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										baoUSD-sUSDe
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 hidden lg:inline-block'>
									<Image src={`/images/platforms/Aura.webp`} height={24} width={24} alt='Aura' className='mr-1 hidden lg:inline' />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bakbak'>
										Aura
									</Typography>
								</span>
							</div>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 items-center justify-center lg:basis-1/5'>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak`}>
								{getDisplayBalance(baoUsdsUSDePool ? baoUsdsUSDePool.apr : 0, 0)}%
							</Typography>
						</div>

						<div className='mx-auto my-0 flex basis-1/4 flex-col items-end justify-center text-right lg:basis-1/5'>
							<Typography variant='base' className='ml-2 inline-block font-bakbak'>
								${getDisplayBalance(baoUsdsUSDePool ? baoUsdsUSDePool.tvl : 0, 0)}
							</Typography>
						</div>
					</div>
				</a>
			</div>
		</>
	)
}

export default ExternalFarms
