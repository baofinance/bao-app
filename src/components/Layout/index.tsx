import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface LayoutProps {
	children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1'>{children}</main>
			<Footer />
		</div>
	)
}

export default Layout
