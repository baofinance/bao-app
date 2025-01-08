import { FC, useEffect, useMemo, useState } from 'react'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { useActiveLendMarket } from '@/hooks/lend/useActiveLendMarket'
import { useSupplyApy } from '@/hooks/lend/useSupplyApy'
import { getDisplayBalance } from '@/utils/numberFormat'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from '@ethersproject/bignumber'
import Image from 'next/future/image'
import { VaultAsset } from '@/bao/lib/types'
import { Erc20__factory } from '@/typechain/factories'
import type { Cether, Ctoken } from '@/typechain'
import { ContractTransaction, PayableOverrides, Overrides } from '@ethersproject/contracts'
import { ethers } from 'ethers'

interface SupplyModalProps {
	isOpen: boolean
	onDismiss: () => void
	marketName: string
	asset: VaultAsset
	maxSupply: BigNumber
}

const SupplyModal: FC<SupplyModalProps> = ({ isOpen, onDismiss, marketName, asset, maxSupply }) => {
	const { account, library, chainId } = useWeb3React()
	const [val, setVal] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [loading, setLoading] = useState(false)
	const [approving, setApproving] = useState(false)
	const [allowance, setAllowance] = useState<BigNumber>(BigNumber.from(0))

	const market = Config.vaults[marketName]
	const activeMarket = useActiveLendMarket(marketName)
	const supplyApys = useSupplyApy(marketName)

	const ctokenContract = useMemo(() => {
		if (!activeMarket || !asset) return null
		return activeMarket.find(m => m.ctokenAddress.toLowerCase() === asset.ctokenAddress[chainId].toLowerCase())?.ctokenContract
	}, [activeMarket, asset, chainId])

	const underlyingContract = useMemo(() => {
		if (!asset || !library || asset.underlyingAddress[chainId] === 'ETH') return null
		return Erc20__factory.connect(asset.underlyingAddress[chainId], library)
	}, [asset, library, chainId])

	const supplyApy = useMemo(() => {
		if (!supplyApys || !asset) return null
		return supplyApys[asset.underlyingAddress[chainId]]
	}, [supplyApys, asset, chainId])

	useEffect(() => {
		const checkAllowance = async () => {
			if (!underlyingContract || !account || !ctokenContract) return
			const allowance = await underlyingContract.allowance(account, ctokenContract.address)
			setAllowance(allowance)
		}
		checkAllowance()
	}, [underlyingContract, account, ctokenContract])

	useEffect(() => {
		if (!val) {
			setError('')
			return
		}

		try {
			const amount = parseUnits(val, asset.underlyingDecimals)
			if (amount.gt(maxSupply)) {
				setError('Amount exceeds balance')
			} else {
				setError('')
			}
		} catch (e) {
			setError('Invalid amount')
		}
	}, [val, asset, maxSupply])

	const handleApprove = async () => {
		if (!underlyingContract || !ctokenContract) return

		try {
			setApproving(true)
			const tx = await underlyingContract.approve(ctokenContract.address, BigNumber.from(2).pow(256).sub(1))
			await tx.wait()
			setAllowance(BigNumber.from(2).pow(256).sub(1))
		} catch (e) {
			console.error('Error approving:', e)
			setError('Failed to approve')
		} finally {
			setApproving(false)
		}
	}

	const handleSupply = async () => {
		if (!account || !ctokenContract || error) return

		try {
			setLoading(true)
			const amount = parseUnits(val, asset.underlyingDecimals)
			let tx: ContractTransaction

			if (asset.underlyingAddress[chainId] === 'ETH') {
				const cEther = ctokenContract as Cether
				tx = await cEther.mint({
					gasLimit: ethers.BigNumber.from(250000),
					value: amount,
					from: account,
				})
			} else {
				const cToken = ctokenContract as Ctoken
				tx = await cToken.mint(amount, {
					gasLimit: ethers.BigNumber.from(250000),
					from: account,
				})
			}

			await tx.wait()
			onDismiss()
		} catch (e) {
			console.error('Error supplying:', e)
			setError('Failed to supply')
		} finally {
			setLoading(false)
		}
	}

	const needsApproval = useMemo(() => {
		if (asset.underlyingAddress[chainId] === 'ETH') return false
		try {
			const amount = parseUnits(val || '0', asset.underlyingDecimals)
			return amount.gt(allowance)
		} catch (e) {
			return false
		}
	}, [val, asset, chainId, allowance])

	return (
		<Modal isOpen={isOpen} onDismiss={onDismiss}>
			<div className='p-4'>
				<Typography variant='lg' className='mb-4 text-center font-bakbak'>
					Supply {asset.name}
				</Typography>

				<div className='flex items-center space-x-3 mb-4'>
					<div className='w-10 h-10 rounded-full bg-baoBlack/60 border border-baoWhite/10 overflow-hidden'>
						<Image src={asset.icon} alt={asset.name} width={40} height={40} />
					</div>
					<div>
						<Typography variant='lg' className='font-bakbak'>
							{asset.name}
						</Typography>
						{supplyApy && (
							<Typography variant='sm' className='text-baoWhite/60'>
								APY: {supplyApy.toFixed(2)}%
							</Typography>
						)}
					</div>
				</div>

				<div className='mb-4'>
					<div className='flex justify-between mb-2'>
						<Typography variant='sm' className='text-baoWhite/60'>
							Available
						</Typography>
						<Typography variant='sm' className='text-baoWhite/60'>
							{getDisplayBalance(maxSupply, asset.underlyingDecimals)}
						</Typography>
					</div>
					<input
						type='number'
						value={val}
						onChange={e => setVal(e.target.value)}
						placeholder='Enter amount'
						className='w-full p-2 rounded bg-baoBlack/40 border border-baoWhite/10 text-white'
					/>
					{error && (
						<Typography variant='sm' className='text-baoRed mt-1'>
							{error}
						</Typography>
					)}
				</div>

				{needsApproval ? (
					<button
						onClick={handleApprove}
						disabled={approving || !val}
						className='w-full p-2 rounded bg-baoRed text-white font-bakbak disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{approving ? 'Approving...' : 'Approve'}
					</button>
				) : (
					<button
						onClick={handleSupply}
						disabled={!account || !!error || loading || !val}
						className='w-full p-2 rounded bg-baoRed text-white font-bakbak disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{loading ? 'Supplying...' : 'Supply'}
					</button>
				)}
			</div>
		</Modal>
	)
}

export default SupplyModal
