import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const Home: React.FC = () => {
	const router = useRouter()

	useEffect(() => {
		router.push('/earn')
	}, [])

	return <></>
}

export default Home
