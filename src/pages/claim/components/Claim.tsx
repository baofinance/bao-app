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

const DEBUG_MERKLE = true

const Claim: React.FC = () => {
	const { account } = useWeb3React()
	const distribution = useContract<BaoClaim>('BaoClaim')

	const [loading, setLoading] = useState(false)
	const [claimed, setClaimed] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [claimWindowActive, setClaimWindowActive] = useState(false)
	const [contractHasBalance, setContractHasBalance] = useState(true)

	// Precompute tree (static)
	const tree = useMemo(() => {
		const lowerSnapshot = (rawSnapshot as string[]).map(addr => addr.toLowerCase())
		const leaves = lowerSnapshot.map(addr => utils.solidityKeccak256(['address'], [addr]))
		return new MerkleTree(leaves, keccak256, { sortPairs: true })
	}, [])

	// Compute leaf/proof
	const { isEligible, proof, paddedProof, leaf } = useMemo(() => {
		if (!account) return { isEligible: false, proof: null, paddedProof: [], leaf: null }

		const lowerSnapshot = (rawSnapshot as string[]).map(addr => addr.toLowerCase())
		if (!lowerSnapshot.includes(account.toLowerCase())) return { isEligible: false, proof: null, paddedProof: [], leaf: null }

		const leaf = utils.solidityKeccak256(['address'], [account])
		const proof = tree.getHexProof(leaf)
		const paddedProof = proof.map(p => utils.hexZeroPad(p, 32))

		return { isEligible: true, proof, paddedProof, leaf }
	}, [account, tree])

	// Encode calldata
	const calldata = useMemo(() => {
		if (!distribution || paddedProof.length === 0) return null
		try {
			return distribution.interface.encodeFunctionData('claim', [paddedProof])
		} catch {
			return null
		}
	}, [distribution, paddedProof])

	// Check if already claimed
	useEffect(() => {
		if (!distribution || !account) return

		const checkClaimStatus = async () => {
			try {
				const [alreadyClaimed] = await distribution.functions.hasClaimed(account)
				setClaimed(alreadyClaimed)
			} catch (err) {
				console.error('Error checking claim status:', err)
			}
		}

		checkClaimStatus()
	}, [distribution, account])

	// Check if there is enough to claim and if the claimwindow is active
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

	// Debug: confirm contract deployed
	useEffect(() => {
		if (!distribution) return
		distribution.provider.getCode(distribution.address).then(code => {
			console.log('📦 Bytecode at address:', code)
			if (code === '0x') {
				console.warn('⚠️ No contract deployed at this address on the current network!')
			}
		})
	}, [distribution])

	const extractError = (err: any): string => {
		return err?.data?.message || err?.error?.message || err?.message || 'Transaction failed'
	}

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

	if (!distribution || !distribution.address || distribution.address === '0x') {
		return (
			<div className='flex flex-col items-center text-center'>
				<Typography variant='xl' className='font-bakbak text-red'>
					The token claim contract is not yet deployed.
				</Typography>
			</div>
		)
	}

	if (!account) {
		return (
			<div className='flex flex-col items-center text-center'>
				<Typography className='mt-2 leading-normal text-baoWhite'>Connect your wallet to check airdrop eligibility.</Typography>
			</div>
		)
	}

	if (!isEligible) {
		return (
			<div className='flex flex-col items-center text-center'>
				<Typography variant='xl' className='font-bakbak text-red'>
					You are not eligible for the token claim.
				</Typography>
			</div>
		)
	}

	if (claimed) {
		return (
			<div className='flex flex-col items-center text-center'>
				<Typography className='mt-2 leading-normal text-baoWhite'>You have successfully claimed your tokens!</Typography>
			</div>
		)
	}

	if (!contractHasBalance) {
		return (
			<div className='flex flex-col items-center text-center'>
				<Typography variant='xl' className='font-bakbak text-red'>
					Claiming unavailable: not enough tokens remain in the contract.
				</Typography>
			</div>
		)
	}

	if (!claimWindowActive) {
		return (
			<div className='flex flex-col items-center text-center'>
				<Typography variant='xl' className='font-bakbak text-yellow-400'>
					Claim window is not currently active.
				</Typography>
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center text-center'>
			<Typography className='mt-2 leading-normal text-baoWhite'>
				You are eligible to claim <strong>10581</strong> BAOv2 tokens.
			</Typography>

			<div className='mt-6'>
				<Button
					onClick={handleClaim}
					disabled={loading || claimed || !isEligible || !account || !distribution || !claimWindowActive || !contractHasBalance}
				>
					{claimed ? 'Already Claimed' : loading ? 'Claiming...' : 'Claim Tokens'}
				</Button>
			</div>

			{DEBUG_MERKLE && (
				<div className='mt-4 text-left text-xs text-baoWhite w-full max-w-lg break-all'>
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
						<ul className='list-disc ml-6 mt-1'>{proof?.map((p, i) => <li key={i}>{p}</li>)}</ul>
					</div>
					{calldata && (
						<div className='mt-4'>
							<strong>📦 Raw Calldata:</strong>
							<div className='mt-1 break-all'>{calldata}</div>
						</div>
					)}
				</div>
			)}

			{error && (
				<Typography variant='xl' className='font-bakbak text-red mt-2'>
					{error}
				</Typography>
			)}
		</div>
	)
}

export default Claim
