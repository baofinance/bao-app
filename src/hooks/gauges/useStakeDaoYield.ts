import { useEffect, useState } from 'react'

export const useStakeDaoYield = () => {
	const [apr, setApr] = useState(null)
	const [tvl, setTvl] = useState(null)

	useEffect(() => {
		fetch('/api/yield/stakedao')
			.then(response => response.json())
			.then(data => {
				const apr = data.apr
				setApr(apr)
				const tvl = data.tvl
				setTvl(tvl)
			})
			.catch(error => {
				console.error(error)
				// Handle the error
			})
	}, [])

	return {
		apr,
		tvl,
	}
}
