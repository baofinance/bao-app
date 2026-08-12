import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Bao, Baov2, Swapper } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const INITIAL_SWAPPER_BALANCE = parseUnits('166850344.226331394130869546')

const parseAmount = (value: string) => {
	try {
		if (!value) return BigNumber.from(0)
		return parseUnits(value)
	} catch {
		return null
	}
}

const LiquidSwap: React.FC = () => {
	const { library, account, chainId } = useWeb3React()
	const [inputVal, setInputVal] = useState('')

	const baoV1Address = Config.contracts.Bao[chainId]?.address || ZERO_ADDRESS
	const baoV2Address = Config.contracts.Baov2[chainId]?.address || ZERO_ADDRESS
	const swapperAddress = Config.contracts.Swapper[chainId]?.address || ZERO_ADDRESS

	const baov1Balance = useTokenBalance(baoV1Address)
	const baov2Balance = useTokenBalance(baoV2Address)
	const swapper = useContract<Swapper>('Swapper', swapperAddress)
	const baoV2 = useContract<Baov2>('Baov2', baoV2Address)

	const enabled = !!chainId && !!account && !!library && !!swapper && !!baoV2 && swapperAddress !== ZERO_ADDRESS
	const { data: swapperBalance, refetch } = useQuery(
		['@/pages/distribution/swapperBalance', { enabled }, providerKey(library, account, chainId)],
		async () => {
			if (!enabled) throw new Error('not enabled')
			return await baoV2.balanceOf(swapper.address)
		},
		{
			enabled,
			placeholderData: INITIAL_SWAPPER_BALANCE,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	const claimedBao = swapperBalance ? INITIAL_SWAPPER_BALANCE.sub(swapperBalance) : BigNumber.from(0)
	const claimedPct =
		INITIAL_SWAPPER_BALANCE.gt(0) && claimedBao.gte(0)
			? (parseFloat(formatUnits(claimedBao)) / parseFloat(formatUnits(INITIAL_SWAPPER_BALANCE))) * 100
			: 0

	const parsedInput = parseAmount(inputVal)
	const v2Out = parsedInput && parsedInput.gt(0) ? formatUnits(parsedInput.div(1000)) : ''

	return (
		<div className='flex flex-col items-center'>
			<div className='w-full md:w-4/5'>
				<Typography variant='lg' className='font-bakbak text-baoWhite'>
					Exchange Unlocked BAO
				</Typography>
				<Typography className='mt-2 leading-normal text-baoWhite'>
					Liquid BAOv1 converts to BAOv2 at a 1,000:1 supply reduction, relative to the ~1 trillion supply snapshot on 11/19/2022. The new
					initial supply is ~1 billion BAOv2 and increases with voting escrow emissions.
				</Typography>
				<div className='mt-8 flex flex-col gap-4 lg:flex-row'>
					<div className='flex w-full flex-col lg:w-3/5'>
						<div className='glassmorphic-card flex h-full flex-col p-6'>
							<div className='mb-1 flex w-full items-center justify-end gap-1'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Wallet
								</Typography>
								<Typography variant='sm' className='font-bakbak'>
									{getDisplayBalance(baov1Balance)} BAO v1
								</Typography>
							</div>
							<Input
								onSelectMax={() => setInputVal(formatUnits(baov1Balance))}
								onChange={(e: React.FormEvent<HTMLInputElement>) => setInputVal(e.currentTarget.value)}
								value={inputVal}
								label={
									<div className='flex flex-row items-center pl-2 pr-3'>
										<div className='flex items-center justify-center gap-1'>
											<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
											<Typography variant='sm' className='font-bakbak'>
												v1
											</Typography>
										</div>
									</div>
								}
							/>
							<div className='my-4 block select-none text-center'>
								<span className='mb-2 rounded-full border-none bg-baoRed bg-opacity-20 p-2 text-lg'>
									<FontAwesomeIcon icon={faArrowDown} size='sm' className='m-auto' />
								</span>
							</div>
							<div className='mb-1 flex w-full items-center justify-end gap-1'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Wallet
								</Typography>
								<Typography variant='sm' className='font-bakbak'>
									{getDisplayBalance(baov2Balance)} BAO v2
								</Typography>
							</div>
							<Input
								onChange={() => undefined}
								disabled={true}
								value={v2Out}
								label={
									<div className='flex flex-row items-center pl-2 pr-3'>
										<div className='flex items-center justify-center gap-1'>
											<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
											<Typography variant='sm' className='font-bakbak'>
												v2
											</Typography>
										</div>
									</div>
								}
							/>
							<div className='mt-6'>
								<SwapperButton inputVal={inputVal} maxValue={baov1Balance} />
							</div>
						</div>
					</div>
					<div className='flex w-full flex-col lg:w-2/5'>
						<div className='glassmorphic-card flex h-full flex-col items-center p-6'>
							<Typography className='mb-4 font-bakbak'>Migration Progress</Typography>
							<div className='m-auto w-[200px]'>
								<CircularProgressbarWithChildren
									value={claimedPct}
									strokeWidth={10}
									styles={buildStyles({
										strokeLinecap: 'butt',
										pathColor: '#e21a53',
										trailColor: '#faf2e340',
									})}
								>
									<div className='flex flex-col items-center justify-center p-4 text-center'>
										<Typography variant='sm' className='text-baoRed'>
											BAOv1 Redeemed
										</Typography>
										<Typography className='font-bakbak'>{claimedPct.toFixed(2)}%</Typography>
									</div>
								</CircularProgressbarWithChildren>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LiquidSwap

const SwapperButton: React.FC<SwapperButtonProps> = ({ inputVal, maxValue }) => {
	const { pendingTx, txHash, handleTx } = useTransactionHandler()
	const { chainId, account } = useWeb3React()

	const baoV1Address = Config.contracts.Bao[chainId]?.address || ZERO_ADDRESS
	const swapperAddress = Config.contracts.Swapper[chainId]?.address || ZERO_ADDRESS

	const baoContract = useContract<Bao>('Bao', baoV1Address)
	const swapper = useContract<Swapper>('Swapper', swapperAddress)
	const inputApproval = useAllowance(baoV1Address, swapperAddress)

	const parsedInput = parseAmount(inputVal)
	const needsApproval = !inputApproval || (parsedInput ? inputApproval.lt(parsedInput) : inputApproval.lte(0))

	const handleClick = async () => {
		if (!account || !baoContract || !swapper || !parsedInput) return

		if (needsApproval) {
			const tx = baoContract.approve(swapper.address, ethers.constants.MaxUint256)
			return handleTx(tx, 'Migration: Approve BAOv1')
		}

		handleTx(swapper.convertV1(account, parsedInput), 'Migration: Swap BAOv1 to BAOv2')
	}

	const buttonText = () => {
		if (!inputApproval) return <Loader />
		return needsApproval ? 'Approve BAOv1' : 'Swap BAOv1 for BAOv2'
	}

	const isDisabled = useMemo(
		() => !account || !inputApproval || !parsedInput || parsedInput.lte(0) || parsedInput.gt(maxValue),
		[account, inputApproval, parsedInput, maxValue],
	)

	return (
		<Button fullWidth onClick={handleClick} disabled={isDisabled} pendingTx={pendingTx} txHash={txHash}>
			{buttonText()}
		</Button>
	)
}

type SwapperButtonProps = {
	inputVal: string
	maxValue: BigNumber
}
