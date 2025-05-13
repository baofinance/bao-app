import { useWeb3React } from '@web3-react/core'
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import type { BaoClaim } from '@/typechain/BaoClaim'
import { useState, useMemo, useEffect } from 'react'
import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
import rawSnapshot from '../../../data/snapshot_bao_normalized.json'
import { utils, Contract } from 'ethers'
import Card from '@/components/Card'
import { Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import baoIcon from '@/assets/icons/bao.png' // Adjust the path accordingly

const DEBUG_MERKLE = true

const Claim: React.FC = () => {
	const { account } = useWeb3React()
	const distribution = useContract<BaoClaim>('BaoClaim')

	const [loading, setLoading] = useState(false)
	const [claimed, setClaimed] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [claimWindowActive, setClaimWindowActive] = useState(false)
	const [contractHasBalance, setContractHasBalance] = useState(true)
	const [showInfo, setShowInfo] = useState(false)

	const tree = useMemo(() => {
		const lowerSnapshot = (rawSnapshot as string[]).map(addr => addr.toLowerCase())
		const leaves = lowerSnapshot.map(addr => utils.solidityKeccak256(['address'], [addr]))
		return new MerkleTree(leaves, keccak256, { sortPairs: true })
	}, [])

	const { isEligible, proof, paddedProof, leaf } = useMemo(() => {
		if (!account) return { isEligible: false, proof: null, paddedProof: [], leaf: null }

		const lowerSnapshot = (rawSnapshot as string[]).map(addr => addr.toLowerCase())
		if (!lowerSnapshot.includes(account.toLowerCase())) return { isEligible: false, proof: null, paddedProof: [], leaf: null }

		const leaf = utils.solidityKeccak256(['address'], [account])
		const proof = tree.getHexProof(leaf)
		const paddedProof = proof.map(p => utils.hexZeroPad(p, 32))

		return { isEligible: true, proof, paddedProof, leaf }
	}, [account, tree])

	const calldata = useMemo(() => {
		if (!distribution || paddedProof.length === 0) return null
		try {
			return distribution.interface.encodeFunctionData('claim', [paddedProof])
		} catch {
			return null
		}
	}, [distribution, paddedProof])

	useEffect(() => {
		if (!distribution || !account) return
		distribution.functions
			.hasClaimed(account)
			.then(([alreadyClaimed]) => setClaimed(alreadyClaimed))
			.catch(err => console.error('Error checking claim status:', err))
	}, [distribution, account])

	useEffect(() => {
		if (!distribution || !account) return
		const checkWindowAndBalance = async () => {
			try {
				const [start, end, balanceRaw] = await Promise.all([
					distribution.startDate(),
					distribution.endDate(),
					distribution.token().then(tokenAddr => {
						const erc20 = new Contract(tokenAddr, ['function balanceOf(address) view returns (uint256)'], distribution.provider)
						return erc20.balanceOf(distribution.address)
					}),
				])
				const now = Math.floor(Date.now() / 1000)
				setClaimWindowActive(now >= start.toNumber() && now <= end.toNumber())
				setContractHasBalance(balanceRaw.gte(utils.parseUnits('10581', 18)))
			} catch (err) {
				console.error('Error checking window/balance:', err)
				setClaimWindowActive(false)
				setContractHasBalance(false)
			}
		}
		checkWindowAndBalance()
	}, [distribution, account])

	useEffect(() => {
		if (!distribution) return
		distribution.provider.getCode(distribution.address).then(code => {
			console.log('📦 Bytecode at address:', code)
		})
	}, [distribution])

	const extractError = (err: any): string => err?.data?.message || err?.error?.message || err?.message || 'Transaction failed'

	const handleClaim = async () => {
		if (!distribution || !account || paddedProof.length === 0) return
		try {
			setLoading(true)
			const calldata = distribution.interface.encodeFunctionData('claim', [paddedProof])
			const signer = distribution.signer
			const tx = await signer.sendTransaction({
				to: distribution.address,
				data: calldata,
				gasLimit: 300_000,
			})
			await tx.wait()
			setClaimed(true)
		} catch (err: any) {
			console.error('❌ Claim via raw calldata failed:', err)
			setError(extractError(err))
		} finally {
			setLoading(false)
		}
	}

	// UI Logic branches
	if (!distribution?.address || distribution.address === '0x') {
		return (
			<Typography variant='xl' className='text-red text-center font-bakbak'>
				The token claim contract is not yet deployed.
			</Typography>
		)
	}

	if (!account) {
		return <Typography className='text-center mt-4 text-baoWhite'>Connect your wallet to check airdrop eligibility.</Typography>
	}

	if (!isEligible) {
		return (
			<Typography variant='xl' className='text-red text-center font-bakbak'>
				You are not eligible for the token claim.
			</Typography>
		)
	}

	if (claimed) {
		return <Typography className='text-center mt-4 text-baoWhite'>You have successfully claimed your tokens!</Typography>
	}

	if (!contractHasBalance) {
		return (
			<Typography variant='xl' className='text-red text-center font-bakbak'>
				Claiming unavailable: not enough tokens remain in the contract.
			</Typography>
		)
	}

	if (!claimWindowActive) {
		return (
			<Typography variant='xl' className='text-yellow-400 text-center font-bakbak'>
				Claim window is not currently active.
			</Typography>
		)
	}

	// Main claim UI
	return (
		<>
			{/* Claim row styled exactly like a vault row in Supply */}
			<div className='flex w-full justify-between place-items-center gap-5 glassmorphic-card p-2'>
				{/* Left: Token card styled like DepositCard */}
				<div className='text-baoWhite flex overflow-hidden rounded-2xl border border-baoWhite/20 bg-baoBlack shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 select-none px-2 py-3 text-sm'>
					<div className='mx-0 my-auto flex h-full justify-center items-center gap-4 w-[200px]'>
						<div className='col-span-3'>
							<img className='z-10 inline-block select-none' src='/images/icons/icon-32.png' alt='BAO' width={24} height={24} />
							<span className='ml-2 inline-block text-left align-middle'>
								<Typography variant='lg' className='font-bakbak'>
									BAO
								</Typography>
							</span>
						</div>
					</div>
				</div>

				{/* Middle: Claim status message */}
				<div className='flex-1 flex items-center justify-center h-10'>
					<Typography className='text-sm text-baoWhite text-center'>
						You are eligible to claim <strong>10581</strong> BAOv2 tokens.
					</Typography>
				</div>

				{/* Right: Buttons aligned like in DepositCard */}
				<div className='m-auto mr-2 flex space-x-2'>
					<Button
						onClick={handleClaim}
						className='!h-12 !px-4 !text-sm'
						disabled={loading || claimed || !isEligible || !account || !distribution || !claimWindowActive || !contractHasBalance}
					>
						{claimed ? 'Already Claimed' : loading ? 'Claiming...' : 'Claim Tokens'}
					</Button>
					<Button className='!p-3' onClick={() => setShowInfo(prev => !prev)}>
						<FontAwesomeIcon icon={showInfo ? faAngleUp : faCircleInfo} width={24} height={24} />
					</Button>
				</div>
			</div>

			{/* Expanded Debug Info section */}
			<Transition
				show={showInfo}
				enter='transition-opacity duration-200'
				enterFrom='opacity-0'
				enterTo='opacity-100'
				leave='transition-opacity duration-100'
				leaveFrom='opacity-100'
				leaveTo='opacity-0'
			>
				<div className='flex p-2 mt-5 space-x-3'>
					<Typography variant='xl' className='text-left font-bakbak text-baoWhite/60'>
						Debug Info
					</Typography>
				</div>

				<div className='mt-2 text-xs text-baoWhite space-y-2 break-all px-2'>
					<div>
						<strong>📍 Account:</strong> {account}
					</div>
					<div>
						<strong>🌿 Leaf:</strong> {leaf}
					</div>
					<div>
						<strong>🌲 Merkle Root:</strong> {'0x' + tree.getRoot().toString('hex')}
					</div>
					<div>
						<strong>🧾 Merkle Proof:</strong>
						<ul className='list-disc ml-6'>{proof?.map((p, i) => <li key={i}>{p}</li>)}</ul>
					</div>
					{calldata && (
						<div>
							<strong>📦 Raw Calldata:</strong>
							<div>{calldata}</div>
						</div>
					)}
				</div>
			</Transition>

			{/* Optional error message */}
			{error && (
				<Typography variant='xl' className='font-bakbak text-red mt-4'>
					{error}
				</Typography>
			)}
		</>
	)
}

export default Claim
