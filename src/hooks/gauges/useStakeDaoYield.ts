import { useEffect, useState } from 'react'

interface YieldData {
	apr?: number
	tvl?: number
}

export const useStakeDaoYield = () => {
	const [apr, setApr] = useState<number | undefined>()
	const [tvl, setTvl] = useState<number | undefined>()

	useEffect(() => {
		fetch('/api/yield/stakedao')
			.then(response => response.json())
			.then((data: YieldData) => {
				const { apr, tvl } = data
				setApr(apr)
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
