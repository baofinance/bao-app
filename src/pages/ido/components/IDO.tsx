import { useWeb3React } from '@web3-react/core'
import { useEffect, useMemo, useState } from 'react'
import { Contract, BigNumber, utils } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
import rawSnapshot from '../../../data/snapshot_vebao_test.json'
import discountDataRaw from '../../../data/discounts.json'

type DiscountEntry = {
	raw: string
	rounded: number
	protocol: 'veFXN' | 'veBao'
}

const discountData = discountDataRaw as Record<string, DiscountEntry>

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const DEPOSIT_CONTRACT_ADDRESS = '0x4D5bB90Ef6Dae6c587C9ACcC3409fAFCF33F7004'

const USDC_ABI = [
	'function allowance(address owner, address spender) view returns (uint256)',
	'function approve(address spender, uint256 amount) returns (bool)',
	'function balanceOf(address owner) view returns (uint256)',
]

const IDO_ABI = ['function deposit(uint256 amount, bytes32[] calldata proof) external', 'function isSaleActive() view returns (bool)']

const DepositBox = () => {
	const { account, library } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()

	const [usdcContract, setUsdcContract] = useState<Contract | null>(null)
	const [idoContract, setIdoContract] = useState<Contract | null>(null)
	const [amount, setAmount] = useState('')
	const [allowance, setAllowance] = useState<BigNumber | null>(null)
	const [balance, setBalance] = useState<BigNumber | null>(null)
	const [isEligible, setIsEligible] = useState(false)
	const [depositWindowOpen, setDepositWindowOpen] = useState(true)
	const [discount, setDiscount] = useState<number | null>(null)

	const lowerSnapshot = useMemo(() => (rawSnapshot as string[]).map(addr => addr.toLowerCase()), [])

	const tree = useMemo(() => {
		const leaves = lowerSnapshot.map(addr => utils.solidityKeccak256(['address'], [addr]))
		return new MerkleTree(leaves, keccak256, { sortPairs: true })
	}, [lowerSnapshot])

	useEffect(() => {
		if (library && account) {
			const signer = library.getSigner()
			setUsdcContract(new Contract(USDC_ADDRESS, USDC_ABI, signer))
			setIdoContract(new Contract(DEPOSIT_CONTRACT_ADDRESS, IDO_ABI, signer))
		}
	}, [library, account])

	useEffect(() => {
		if (!usdcContract || !account) return
		const fetchAllowance = async () => {
			try {
				const res = await usdcContract.allowance(account, DEPOSIT_CONTRACT_ADDRESS)
				setAllowance(res)
				const bal = await usdcContract.balanceOf(account)
				setBalance(bal)
			} catch (e) {
				console.error('Error fetching allowance/balance:', e)
			}
		}
		fetchAllowance()
	}, [usdcContract, account])

	useEffect(() => {
		if (!account) return
		setIsEligible(lowerSnapshot.includes(account.toLowerCase()))
	}, [account, lowerSnapshot])

	useEffect(() => {
		if (!idoContract) return
		const checkSaleActive = async () => {
			try {
				const active = await idoContract.isSaleActive()
				setDepositWindowOpen(active)
			} catch (e) {
				console.error('Failed to check sale status:', e)
				setDepositWindowOpen(false)
			}
		}
		checkSaleActive()
	}, [idoContract])

	useEffect(() => {
		if (!account) {
			setDiscount(null)
			return
		}

		const entry = discountData[account.toLowerCase()]
		if (!entry) {
			setDiscount(null)
			return
		}

		const { rounded, protocol } = entry
		let computed = 0

		if (protocol === 'veFXN') computed = rounded * 150
		else if (protocol === 'veBao') computed = rounded * 0.25

		setDiscount(computed) // STEAM tokens
	}, [account])

	const handleApprove = async () => {
		if (!usdcContract) return
		try {
			const parsedAmount = parseUnits(amount || '0', 6)
			const txPromise = usdcContract.approve(DEPOSIT_CONTRACT_ADDRESS, parsedAmount)
			handleTx(txPromise, `Approve ${formatUnits(parsedAmount, 6)} USDC`)
		} catch (err) {
			console.error('Approval error:', err)
		}
	}

	const handleDeposit = async () => {
		if (!idoContract || !account || !isEligible) {
			alert('You are not eligible to deposit.')
			return
		}

		try {
			const lowerAddr = account.toLowerCase()
			const leaf = utils.solidityKeccak256(['address'], [lowerAddr])
			const proof = tree.getHexProof(leaf)
			const parsedAmount = parseUnits(amount || '0', 6)

			const calldata = idoContract.interface.encodeFunctionData('deposit', [parsedAmount, proof])
			console.log('Encoded Calldata:', calldata)

			const txPromise = idoContract.deposit(parsedAmount, proof)
			handleTx(txPromise, `Deposit ${formatUnits(parsedAmount, 6)} USDC`)
		} catch (err) {
			console.error('Deposit error:', err)
		}
	}

	const parsedAmount = parseUnits(amount || '0', 6)
	const isApproved = allowance && parsedAmount.lte(allowance)
	const hasBalance = balance && parsedAmount.lte(balance)

	return (
		<div className='glassmorphic-card p-6 space-y-5 max-w-xl mx-auto'>
			<Typography variant='xl' className='text-left font-bakbak'>
				Deposit USDC
			</Typography>

			{!depositWindowOpen && (
				<Typography variant='sm' className='text-yellow-400 font-bakbak'>
					The deposit window is currently closed.
				</Typography>
			)}

			<Input
				value={amount}
				onChange={e => setAmount(e.currentTarget.value)}
				placeholder='Enter amount'
				className='w-full'
				disabled={!depositWindowOpen}
			/>

			{!isEligible && (
				<Typography variant='sm' className='text-red'>
					You are not eligible to deposit (not in Merkle snapshot).
				</Typography>
			)}

			<div className='flex gap-4'>
				{!isApproved ? (
					<Button className='!w-full' onClick={handleApprove} disabled={Boolean(pendingTx) || !depositWindowOpen}>
						{pendingTx ? 'Approving...' : 'Approve'}
					</Button>
				) : (
					<Button
						className='!w-full'
						onClick={handleDeposit}
						disabled={Boolean(pendingTx) || !hasBalance || parsedAmount.eq(0) || !isEligible || !depositWindowOpen}
					>
						{pendingTx ? 'Depositing...' : 'Deposit'}
					</Button>
				)}
			</div>

			{balance && (
				<Typography variant='sm' className='text-baoWhite text-right'>
					Balance: {formatUnits(balance, 6)} USDC
				</Typography>
			)}

			{discount !== null && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
				<div className='pt-2 border-t border-white/20 mt-4 text-sm text-baoWhite space-y-1'>
					<div className='flex justify-between'>
						<span className='opacity-70'>Max STEAM allocation ({discountData[account?.toLowerCase()]?.protocol || '—'}):</span>
						<span>{discount.toLocaleString()} STEAM</span>
					</div>
					<div className='flex justify-between'>
						<span className='opacity-70'>Max discounted deposit:</span>
						<span>{(discount * 0.08).toFixed(2)} USDC</span>
					</div>
					<div className='flex justify-between'>
						<span className='opacity-70'>You are using:</span>
						<span>
							{parseFloat(amount).toFixed(2)} USDC ({((parseFloat(amount) / (discount * 0.08)) * 100).toFixed(2)}%)
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

export default DepositBox
