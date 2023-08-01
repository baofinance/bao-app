import fetch from 'node-fetch'

export default async function handler(req, res) {
	try {
		const response = await fetch('https://lockers.stakedao.org/api/strategies/cache/balancer')
		const data = await response.json()

		const entry = data.find(entry => entry.key === 'b_baousd_lusd')

		if (entry) {
			const name = entry.name
			const key = entry.key
			const description = entry.description
			const protocol = entry.protocol
			const chainId = entry.chainId
			const assetsSymbols = entry.assetsSymbols
			const apr = entry.projectedAprWithoutUserBoost
			const tvl = entry.tvlUSD

			res.status(200).json({ name, key, description, protocol, chainId, assetsSymbols, apr, tvl })
		} else {
			res.status(404).json({ error: 'Entry not found' })
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Something went wrong' })
	}
}
