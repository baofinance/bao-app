import Typography from '@/components/Typography'
import { Balance } from '@/bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { getDisplayBalance } from '@/utils/numberFormat'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import Image from 'next/future/image'

interface BorrowedCardProps {
	marketName: string
	borrowBalances: Balance[]
}

const BorrowedCard: React.FC<BorrowedCardProps> = ({ marketName, borrowBalances }) => {
	const { chainId } = useWeb3React()
	const market = Config.vaults[marketName]
	const borrowApys = useBorrowApy(marketName)

	if (!market) return null

	return (
		<div className='glassmorphic-card p-4'>
			<Typography variant='lg' className='mb-4 text-center font-bakbak'>
				Borrowed Assets
			</Typography>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{market.assets
					.filter(asset => asset.borrow && asset.active)
					.map(asset => {
						const underlyingAddress = asset.underlyingAddress[chainId]
						const borrowBalance = borrowBalances?.find(b => b.address === underlyingAddress)
						const borrowApy = borrowApys[underlyingAddress]

						return (
							<div key={asset.id} className='bg-baoBlack/40 rounded-xl p-4 border border-baoWhite/10'>
								<div className='flex items-center justify-between mb-4'>
									<div className='flex items-center space-x-3'>
										<div className='w-10 h-10 rounded-full bg-baoBlack/60 border border-baoWhite/10 overflow-hidden'>
											<Image src={asset.icon} alt={asset.name} width={40} height={40} />
										</div>
										<div>
											<Typography variant='lg' className='font-bakbak'>
												{asset.name}
											</Typography>
											{asset.isSynth && (
												<Typography variant='sm' className='text-baoRed'>
													Synthetic
												</Typography>
											)}
											{asset.minimumBorrow && (
												<Typography variant='sm' className='text-baoWhite/60'>
													Min: {asset.minimumBorrow}
												</Typography>
											)}
										</div>
									</div>

									<div className='text-right'>
										<Typography variant='sm' className='text-baoWhite/60'>
											Borrowed
										</Typography>
										<Typography variant='lg'>
											{borrowBalance ? getDisplayBalance(borrowBalance.balance, borrowBalance.decimals) : '0.00'}
										</Typography>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div>
										<Typography variant='sm' className='text-baoWhite/60'>
											APR
										</Typography>
										<Typography variant='lg'>{borrowApy ? `${borrowApy.toFixed(2)}%` : '0.00%'}</Typography>
									</div>
									{asset.desc && (
										<div>
											<Typography variant='sm' className='text-baoWhite/60'>
												Description
											</Typography>
											<Typography variant='lg'>{asset.desc}</Typography>
										</div>
									)}
								</div>
							</div>
						)
					})}
			</div>
		</div>
	)
}

export default BorrowedCard
