import classNames from 'classnames'
import React from 'react'
import Typography from '../Typography'

type ListHeaderProps = {
	headers: string[]
	className?: string
}

export const ListHeader: React.FC<ListHeaderProps> = ({ headers, className }: ListHeaderProps) => {
	return (
		<div className={classNames(`flex flex-row px-2 py-3`, className)}>
			{headers.map((header: string) => (
				<Typography
					variant='lg'
					className='flex w-full flex-col items-center pb-0 text-center font-bakbak first:items-start last:items-end'
					key={header}
				>
					{header}
				</Typography>
			))}
		</div>
	)
}
