import { useEffect, useState } from 'react'

interface LlamaPool {
	chain: string
	project: string
	symbol: string
	tvlUsd: number
	apyBase?: number
	apyReward?: number
	apy: number
	pool: string
}

export function useDefiLlamaApy(llamaId: string | undefined, isPT?: boolean) {
	const [apy, setApy] = useState<number>(0)

	useEffect(() => {
		const fetchApy = async () => {
			if (!llamaId) {
				console.log('No llamaId provided')
				return
			}

			try {
				console.log('Fetching APY for market:', {
					llamaId,
					isPT,
					stack: new Error().stack,
				})

				const response = await fetch('https://yields.llama.fi/pools')
				const data = await response.json()
				console.log('DeFi Llama pools response:', {
					totalPools: data.data.length,
					pools: data.data.filter((p: any) => p.project.toLowerCase().includes('ether.fi') || p.symbol.toLowerCase().includes('weeth')),
				})

				const pendlePools = data.data.filter(p => p.project.toLowerCase() === 'pendle')
				const lidoPools = data.data.filter(p => p.project.toLowerCase() === 'lido')
				const ethenaPools = data.data.filter(p => p.project.toLowerCase() === 'ethena' || p.symbol.toLowerCase().includes('susde'))
				const rocketPools = data.data.filter(p => p.project.toLowerCase() === 'rocket-pool')

				console.log(
					'Pendle pools:',
					pendlePools.map(p => ({
						symbol: p.symbol,
						pool: p.pool,
						apy: p.apy,
						project: p.project,
					})),
				)

				console.log('Potential matches:', {
					llamaId,
					lidoMatches: lidoPools.filter(p => ['steth', 'wsteth'].includes(p.symbol.toLowerCase())),
					rocketMatches: rocketPools.filter(p => p.symbol.toLowerCase() === 'reth'),
				})

				let pool: LlamaPool | undefined

				if (isPT) {
					pool = pendlePools.find(p => {
						const idMatch = llamaId.toLowerCase().includes(p.symbol.toLowerCase())
						const symbolMatch = p.symbol.toLowerCase().includes('pt')
						const dateMatch = llamaId.includes(p.symbol.split('-').pop() || '')
						console.log('Checking PT match:', {
							symbol: p.symbol,
							llamaId,
							idMatch,
							symbolMatch,
							dateMatch,
						})
						return idMatch || (symbolMatch && dateMatch)
					})
				} else {
					switch (llamaId) {
						case 'ethena-susde': {
							const apy = data?.apy ?? 0
							return apy.toString()
						}
						case 'ether-fi-staked-eth': {
							const etherFiPools = data.data.filter(p => p.project.toLowerCase() === 'ether.fi' || p.symbol.toLowerCase() === 'weeth')
							return etherFiPools[0]?.apy.toString() || '0'
						}
						case 'lido':
							pool = lidoPools.find(p => ['steth', 'wsteth'].includes(p.symbol.toLowerCase()))
							break
						case 'rocket-pool':
							pool = rocketPools.find(p => p.symbol.toLowerCase() === 'reth')
							break
						default:
							return '0'
					}
				}

				console.log('Found pool:', pool)

				if (llamaId === 'ethena-susde' && !pool) {
					try {
						const ethenaResponse = await fetch('https://api.ethena.fi/metrics')
						const ethenaData = await ethenaResponse.json()
						if (ethenaData?.apy) {
							console.log('Using Ethena API APY:', ethenaData.apy)
							setApy(ethenaData.apy)
							return
						}
					} catch (ethenaError) {
						console.error('Error fetching from Ethena API:', ethenaError)
					}
				}

				console.log('Found pool with APY:', {
					llamaId,
					pool,
					apy: pool?.apy,
				})

				if (pool) {
					setApy(pool.apy)
				}
			} catch (error) {
				console.error('Error fetching APY:', error)
			}
		}

		fetchApy()
	}, [llamaId, isPT])

	return apy
}
