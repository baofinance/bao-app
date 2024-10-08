import { ActiveSupportedVault } from '@/bao/lib/types'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React from 'react'
import { faDashboard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type DashboardCardProps = {
	asset: ActiveSupportedVault
	vaultName: string
	mintVal: string
	depositVal: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({ asset, vaultName, mintVal, depositVal }: DashboardCardProps) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const accountLiquidity = useAccountLiquidity(vaultName)

	// const borrowed = useMemo(
	// 	() => asset && borrowBalances && borrowBalances.find(balance => balance.address === asset.vaultAddress).balance,
	// 	[borrowBalances, asset],
	// )

	const change = mintVal && depositVal ? BigNumber.from(mintVal).sub(BigNumber.from(depositVal)) : BigNumber.from(0)
	const borrow = accountLiquidity ? accountLiquidity.usdBorrow : BigNumber.from(0)
	const newBorrow = borrow ? borrow.sub(change.gt(0) ? change : 0) : BigNumber.from(0)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(exponentiate(accountLiquidity.usdBorrowable)) : BigNumber.from(0)
	const newBorrowable = asset && decimate(borrowable).sub(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))

	const borrowChange = borrow.add(exponentiate(change))
	const healthFactor = useHealthFactor(vaultName, borrowChange)

	// const healthFactorColor = (healthFactor: BigNumber) => {
	// 	const c = healthFactor.eq(0)
	// 		? `${(props: any) => props.theme.color.text[100]}`
	// 		: healthFactor.lte(parseUnits('1.25'))
	// 			? '#e32222'
	// 			: healthFactor.lt(parseUnits('1.55'))
	// 				? '#ffdf19'
	// 				: '#45be31'
	// 	return c
	// }

	return decimate(accountLiquidity.usdBorrow) ? (
		decimate(accountLiquidity.usdBorrow) > BigNumber.from(0) ? (
			<>
				<div className='col-span-4 order-first lg:order-3 lg:w-full lg:mr-0'>
					<div className='relative w-full h-6 bg-baoWhite/30 rounded-full border border-1 border-baoBlack/50 shadow-xl'>
						<div
							className='absolute top-0 left-0 h-6 rounded bg-baoRed'
							style={{
								width: `${parseFloat(
									getDisplayBalance(
										accountLiquidity && newBorrowable && !newBorrowable.eq(0)
											? (parseFloat(accountLiquidity.usdBorrow.toString()) / parseFloat(newBorrowable.toString())) * 100
											: 0,
										18,
										2,
									),
								)}%`,
							}}
						></div>
						<div className='absolute inset-0 flex flex-col items-center justify-center'>
							<Typography variant='sm' className='font-bakbak text-baoWhite whitespace-nowrap'>
								Debt Health:{' '}
								{healthFactor &&
									(healthFactor.lte(BigNumber.from(0))
										? '-'
										: healthFactor.gt(parseUnits('10000'))
											? '∞'
											: getDisplayBalance(healthFactor))}
							</Typography>
						</div>
					</div>
				</div>

				<div className='mb-2 flex w-full flex-row items-center gap-4 rounded border-0 align-middle'>
					<div className='flex h-fit w-fit flex-row items-center p-4 align-middled'>
						<FontAwesomeIcon icon={faDashboard} size='lg' />
					</div>
					{/*Desktop*/}
					<div className='hidden w-full !px-4 !py-4 lg:flex gap-12'>
						<div className='h-10 w-[2px] bg-baoWhite bg-opacity-40 my-auto' />
						<div className='mx-auto my-0 flex w-full items-center justify-between place-content-between'>
							<div className='flex gap-5 flex-wrap w-full justify-between place-content-between'>
								<div className='col-span-1 break-words text-left'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Your Collateral
									</Typography>
									<Typography variant='h3' className='inline-block font-bakbak text-left leading-5'>
										$
										{`${
											bao && account && accountLiquidity
												? getDisplayBalance(decimate(BigNumber.from(accountLiquidity.usdSupply.toString())), 18, 2)
												: 0
										}`}
									</Typography>
								</div>
								<div className='col-span-1 break-words'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Your Debt
									</Typography>
									<Typography variant='h3' className='inline-block text-left font-bakbak leading-5'>
										${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}
									</Typography>
								</div>
								<div className='col-span-1 break-words text-left'>
									<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
										Debt Limit Used
									</Typography>
									<Typography variant='h3' className='inline-block font-bakbak leading-5'>
										{getDisplayBalance(!newBorrowable.eq(0) ? newBorrow.div(newBorrowable).mul(100) : 0, 18, 2)}%
									</Typography>
								</div>
								<div className='col-span-1 break-words text-left'>
									<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
										Debt Limit Remaining
									</Typography>
									<Typography variant='h3' className='inline-block font-bakbak leading-5'>
										${getDisplayBalance(accountLiquidity ? accountLiquidity.usdBorrowable.sub(change) : BigNumber.from(0))}
									</Typography>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		) : (
			<></>
		)
	) : (
		<></>
	)
}

export default DashboardCard
