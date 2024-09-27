import { ActiveSupportedGauge } from '@/bao/lib/types'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import usePrice from '@/hooks/base/usePrice'
import useGaugeInfo from '@/hooks/earn/useGaugeInfo'
import useGaugeTVL from '@/hooks/earn/useGaugeTVL'
import useGauges from '@/hooks/earn/useGauges'
import useMintable from '@/hooks/earn/useMintable'
import useRelativeWeight from '@/hooks/earn/useRelativeWeight'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import GaugeModal from './Modals'
import Tooltipped from '@/components/Tooltipped'
import ReactSwitch from 'react-switch'
import { Icon } from '@/components/Icon'

const GaugeList: React.FC = () => {
	const gauges = useGauges()
	const [active, setActive] = useState(true)
	const [filteredGauges, setFilteredGauges] = useState(gauges.filter(gauge => gauge.active === true))
	const handleActiveToggle = () => {
		const updateActive = !active
		setActive(updateActive)

		if (updateActive) {
			setFilteredGauges(gauges.filter(gauge => gauge.active === updateActive))
		} else {
			setFilteredGauges(gauges)
		}
	}

	// Add a deprecation notice at the top of the component
	const DeprecationNotice = () => (
		<div className='bg-baoBlack border-l-4 border-baoRed text-baoWhite  p-4 mb-4'>
			<p className='font-bold'>Deprecation Notice</p>
			<p>
				Current gauges will be deprecated soon. Please be aware that this feature will be removed in a future update and will be replaced
				with a new rewards system.
			</p>
		</div>
	)

	return (
		<>
			<DeprecationNotice />
			<div className={`flex w-full flex-row gap-2 px-2 py-3`}>
				<ReactSwitch
					checked={active}
					onChange={handleActiveToggle}
					offColor={`#1e2022`}
					onColor={`#e21a31`}
					className={`border border-baoWhite border-opacity-20`}
				/>
				<Typography className='text-center font-bakbak text-base lg:text-lg'>Active gauges only</Typography>
			</div>
			<div className={`flex w-full flex-row px-2 py-3`}>
				<Typography className='flex w-full basis-1/3 flex-col items-center px-4 pb-0 font-bakbak text-base first:items-start lg:basis-2/5 lg:text-lg'>
					{isDesktop && 'Gauge'} Name
				</Typography>
				<Typography className='text-center font-bakbak text-base lg:basis-1/5 lg:text-lg'>APR</Typography>
				<Typography className='text-center font-bakbak text-base lg:basis-1/5 lg:text-lg'></Typography>
				<Typography className='flex w-full basis-1/3 flex-col items-center px-4 pb-0 font-bakbak text-base last:items-end lg:basis-1/5 lg:text-lg'>
					TVL
				</Typography>
			</div>
			<div className='flex flex-col gap-4'>
				{filteredGauges.length ? (
					filteredGauges.map((gauge: ActiveSupportedGauge, i: number) => (
						<React.Fragment key={i}>
							<GaugeListItem gauge={gauge} />
						</React.Fragment>
					))
				) : (
					<PageLoader block />
				)}
			</div>
		</>
	)
}

interface GaugeListItemProps {
	gauge: ActiveSupportedGauge
}

const GaugeListItem: React.FC<GaugeListItemProps> = ({ gauge }) => {
	const decimals = 17
	const DECIMAL = BigNumber.from(10).pow(decimals)

	const { account } = useWeb3React()
	const [showGaugeModal, setShowGaugeModal] = useState(false)
	const { currentWeight } = useRelativeWeight(gauge.gaugeAddress)
	const baoPrice = usePrice('bao-finance-v2')

	const mintable = useMintable()
	const { gaugeTVL, depositAmount } = useGaugeTVL(gauge)
	const rewardsValue = baoPrice ? baoPrice.mul(mintable) : BigNumber.from(0)
	const rewardsAPR =
		gauge.active == true && gaugeTVL && gaugeTVL.gt(0)
			? rewardsValue
					.mul(currentWeight.gt(0) ? currentWeight : DECIMAL)
					.div(gaugeTVL)
					.mul(100)
					.toString()
			: BigNumber.from(0)

	const gaugeInfo = useGaugeInfo(gauge)
	const veInfo = useVeInfo()

	const lockInfo = useLockInfo()
	const veEstimate = lockInfo ? parseFloat(formatUnits(lockInfo.balance)) : 0
	const totalVePower = veInfo ? parseFloat(formatUnits(veInfo.totalSupply)) : 0
	const tvl = parseFloat(formatUnits(decimate(gaugeTVL ? gaugeTVL : BigNumber.from(0))))

	const boost = useMemo(() => {
		const _depositAmount = depositAmount ? formatUnits(decimate(depositAmount)) : '0'
		const l = parseFloat(_depositAmount) * 1e18
		const working_balances = gaugeInfo && account ? parseFloat(gaugeInfo.workingBalance.toString()) : 1 * 1e18 //determine workingBalance of depositAmount
		const working_supply = gaugeInfo && parseFloat(gaugeInfo.workingSupply.toString())
		const L = tvl * 1e18 + l
		const lim = (l * 40) / 100
		const veBAO = veEstimate * 1e18
		const limplus = lim + (L * veBAO * 60) / (totalVePower * 1e20)
		const limfinal = Math.min(l, limplus)
		const old_bal = working_balances
		const noboost_lim = (l * 40) / 100
		const noboost_supply = working_supply + noboost_lim - old_bal
		const _working_supply = working_supply + limfinal - old_bal
		const boost = limfinal / _working_supply / (noboost_lim / noboost_supply)

		return boost
	}, [account, depositAmount, gaugeInfo, totalVePower, tvl, veEstimate])

	return (
		<>
			<button
				className='glassmorphic-card w-full px-4 py-2 duration-300 hover:cursor-pointer hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20'
				onClick={() => setShowGaugeModal(true)}
				disabled={!account}
			>
				<div className='flex w-full flex-row'>
					<div className='flex basis-1/3 lg:basis-2/5'>
						<div className='mx-0 my-auto inline-block h-full items-center'>
							<div className='mr-2 hidden lg:inline-block'>
								<Image className='z-10 inline-block select-none' src={gauge.iconA} alt={gauge.symbol} width={24} height={24} />
								{gauge.iconB && (
									<Image className='z-20 -ml-2 inline-block select-none' src={gauge.iconB} alt={gauge.symbol} width={24} height={24} />
								)}
							</div>
							<span className='inline-block text-left align-middle'>
								<Typography variant='base' className='font-bakbak'>
									{gauge.name}
								</Typography>
								<Typography className={`flex align-middle font-bakbak text-baoRed`}>
									<Image
										src={`/images/platforms/${gauge.type}.png`}
										height={16}
										width={16}
										alt={gauge.type}
										className='mr-1 hidden lg:inline'
									/>
									{gauge.type}
								</Typography>
							</span>
						</div>
					</div>

					<div className='mx-auto my-0 flex basis-1/3 items-center justify-center lg:basis-1/5'>
						<Tooltipped
							content={`Max APR can be reached with a max boost of 2.5x. Your APR is: ${getDisplayBalance(
								isNaN(boost) ? rewardsAPR : parseFloat(rewardsAPR.toString()) * boost,
							)}%`}
							placement='top'
						>
							<Typography variant='base' className={`ml-2 inline-block font-bakbak ${!isNaN(boost) && `rainbow`}`}>
								{getDisplayBalance(rewardsAPR)}% ➝ {getDisplayBalance(parseFloat(rewardsAPR.toString()) * 2.5)}%
							</Typography>
						</Tooltipped>
					</div>

					<div className='mx-auto my-0 flex basis-1/3 flex-col items-end justify-center text-right lg:basis-1/5'>
						{!gauge.active && <Icon icon='archived' className='m-0 h-10 w-10 flex-none' />}
					</div>

					<div className='mx-auto my-0 flex basis-1/3 flex-col items-end justify-center text-right lg:basis-1/5'>
						<Typography variant='base' className='ml-2 inline-block font-bakbak'>
							${getDisplayBalance(formatUnits(gaugeTVL ? gaugeTVL : BigNumber.from(0)))}
						</Typography>
					</div>
				</div>
			</button>
			<GaugeModal gauge={gauge} tvl={gaugeTVL} rewardsValue={rewardsValue} show={showGaugeModal} onHide={() => setShowGaugeModal(false)} />
		</>
	)
}

export default GaugeList
