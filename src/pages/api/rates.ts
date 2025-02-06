import { useSupplyRate } from '@/hooks/lend'

export default async function handler(req, res) {
	const { market, address, chainId, llamaId } = req.query

	try {
		const rate = await useSupplyRate(market, { [chainId]: address }, llamaId)
		res.status(200).json(rate)
	} catch (error) {
		console.error('Error fetching rate:', error)
		res.status(500).json({ error: 'Failed to fetch rate' })
	}
}
