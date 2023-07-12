import React, { PropsWithChildren } from 'react'

import Footer from '@/components/Footer'

import Container from '../Container'

interface PageProps {
	children: any
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({ children }) => (
	<>
		<div className='absolute left-0 top-[72px] h-[calc(100vh-72px)] w-full'>
			<div className='left-0 top-0 min-h-[calc(100vh-72px)] align-middle'>
				<div className='flex min-h-[calc(100vh-240px)] flex-col items-center'>
					<Container>{children}</Container>
				</div>
				<Footer />
			</div>
		</div>
	</>
)

export default Page
