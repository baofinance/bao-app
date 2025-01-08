import { FC, ReactNode, useState } from 'react'
import { Transition } from '@headlessui/react'

interface TooltipProps {
	content: ReactNode
	children: ReactNode
	className?: string
}

const Tooltip: FC<TooltipProps> = ({ content, children, className = '' }) => {
	const [show, setShow] = useState(false)

	return (
		<div className={`relative inline-block ${className}`} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
			{children}
			<Transition
				show={show}
				enter='transition ease-out duration-100'
				enterFrom='transform opacity-0 scale-95'
				enterTo='transform opacity-100 scale-100'
				leave='transition ease-in duration-75'
				leaveFrom='transform opacity-100 scale-100'
				leaveTo='transform opacity-0 scale-95'
			>
				<div className='absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2'>
					<div className='bg-baoBlack rounded px-2 py-1 text-sm text-baoWhite'>{content}</div>
					<div className='absolute top-full left-1/2 transform -translate-x-1/2 -mt-1'>
						<div className='w-2 h-2 bg-baoBlack rotate-45 transform origin-center' />
					</div>
				</div>
			</Transition>
		</div>
	)
}

export default Tooltip
