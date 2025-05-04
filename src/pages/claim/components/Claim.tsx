import { useWeb3React } from '@web3-react/core'
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import { BaoTokenClaim } from '@/typechain/BaoTokenClaim'
import { useState, useMemo } from 'react'
import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
import rawSnapshot from '../../../data/snapshot_bao_normalized.json'

const Claim: React.FC = () => {
	const { account } = useWeb3React()
	const distribution = useContract<BaoTokenClaim>('BaoTokenClaim')

	const [loading, setLoading] = useState(false)
	const [claimed, setClaimed] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const { isEligible, proof } = useMemo(() => {
		if (!account) return { isEligible: false, proof: null }

		const lowerSnapshot = (rawSnapshot as string[]).map(addr => addr.toLowerCase())
		const leaves = lowerSnapshot.map(addr => keccak256(addr))
		const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })

		const user = account.toLowerCase()
		if (!lowerSnapshot.includes(user)) return { isEligible: false, proof: null }

		const leaf = keccak256(user)
		const proof = tree.getHexProof(leaf)

		return { isEligible: true, proof }
	}, [account])

	const handleClaim = async () => {
		if (!distribution || !proof) return

		try {
			setLoading(true)
			const tx = await distribution.claim(proof)
			await tx.wait()
			setClaimed(true)
		} catch (err: any) {
			setError(err.message)
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

	return (
		<div className='flex flex-col items-center text-center'>
			<Typography className='mt-2 leading-normal text-baoWhite'>
				You are eligible to claim <strong>10581</strong> BAOv2 tokens.
			</Typography>
			<Button onClick={handleClaim} disabled={loading}>
				{loading ? 'Claiming Tokens...' : 'Claim Tokens'}
			</Button>
			{error && (
				<Typography variant='xl' className='font-bakbak text-red mt-2'>
					{error}
				</Typography>
			)}
		</div>
	)
}

export default Claim
