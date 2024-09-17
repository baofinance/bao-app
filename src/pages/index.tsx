import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const Home: React.FC = () => {
	const router = useRouter()

	useEffect(() => {
		router.push('/earn')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return <></>
}

export default Home
