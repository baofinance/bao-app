import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import useBackstops from '@/hooks/earn/useBackstops'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/future/image'
import React, { useState } from 'react'
import { isDesktop } from 'react-device-detect'
import BackstopModal from './BackstopModals'

const BackstopList: React.FC = () => {
	const backstops = useBackstops()

	return (
		<>
			<div className={`flex w-full flex-row px-2 py-3`}>
				<Typography className='flex w-full basis-1/3 flex-col items-center px-4 pb-0 font-bakbak text-base first:items-start lg:basis-2/5 lg:text-lg'>
					{isDesktop && 'Pool'} Name
				</Typography>
				<Typography className='text-center font-bakbak text-base lg:basis-2/5 lg:text-lg'>APR</Typography>
				<Typography className='flex w-full basis-1/3 flex-col items-center px-4 pb-0 font-bakbak text-base last:items-end lg:basis-1/5 lg:text-lg'>
					TVL
				</Typography>
			</div>
			<div className='flex flex-col gap-4'>
				{backstops.length ? (
					backstops.map((backstop: ActiveSupportedBackstop, i: number) => (
						<React.Fragment key={i}>
							<BackstopListItem backstop={backstop} />
						</React.Fragment>
					))
				) : (
					<PageLoader block />
				)}
			</div>
		</>
	)
}

interface BackstopListItemProps {
	backstop: ActiveSupportedBackstop
}

const BackstopListItem: React.FC<BackstopListItemProps> = ({ backstop }) => {
	const { account } = useWeb3React()
	const [showBackstopModal, setShowBackstopModal] = useState(false)

	return (
		<>
			<button
				className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
				onClick={() => setShowBackstopModal(true)}
				disabled={!account}
			>
				<div className='flex w-full flex-row'>
					<div className='flex basis-1/3 lg:basis-2/5'>
						<div className='mx-0 my-auto inline-block h-full items-center'>
							<div className='mr-2 hidden lg:inline-block'>
								<Image className='z-10 inline-block select-none' src={backstop.icon} alt={backstop.symbol} width={24} height={24} />
							</div>
							<span className='inline-block text-left align-middle'>
								<Typography variant='base' className='font-bakbak'>
									{backstop.name}
								</Typography>
								<Typography className={`flex align-middle font-bakbak text-baoRed`}>
									<Image
										src={`/images/platforms/BProtocol.webp`}
										height={16}
										width={16}
										alt={backstop.type}
										className='mr-1 hidden lg:inline'
									/>
									{backstop.type}
								</Typography>
							</span>
						</div>
					</div>

					<div className='mx-auto my-0 flex basis-1/3 items-center justify-center lg:basis-2/5'>-</div>

					<div className='mx-auto my-0 flex basis-1/3 flex-col items-end justify-center text-right lg:basis-1/5'>
						<Typography variant='base' className='ml-2 inline-block font-bakbak'>
							-
						</Typography>
					</div>
				</div>
			</button>
			<BackstopModal backstop={backstop} show={showBackstopModal} onHide={() => setShowBackstopModal(false)} />
		</>
	)
}

export default BackstopList
