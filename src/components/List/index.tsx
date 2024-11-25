import React, { FC, ReactNode } from 'react'
import Typography from '@/components/Typography'

interface ListProps {
	children: ReactNode
}

interface ListHeaderProps {
	headers: string[]
}

const List: FC<ListProps> = ({ children }) => {
	return <div className='flex flex-col gap-4'>{children}</div>
}

const ListHeader: FC<ListHeaderProps> = ({ headers }) => {
	return (
		<div className='flex w-full flex-row px-4 py-2'>
			{headers.map((header, i) => (
				<div key={i} className={`flex w-full ${i > 0 ? 'justify-center' : ''}`}>
					<Typography variant='sm' className='text-baoWhite/60'>
						{header}
					</Typography>
				</div>
			))}
		</div>
	)
}

export { List, ListHeader }
