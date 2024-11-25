import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { Tooltip } from '@material-tailwind/react/components/Tooltip'
import React from 'react'

import classNames from 'classnames'

interface TooltippedProps {
	content: any
	children?: any
	placement?: any
	className?: any
	interactive?: boolean
	delay?: number[]
}

const Tooltipped: React.FC<TooltippedProps> = ({ children, content, placement, className, interactive, delay }) => (
	<>
		<Tooltip
			id={Math.random().toString()}
			content={content}
			placement={placement}
			offset={10}
			interactive={interactive}
			delay={delay}
			className={classNames(
				'z-[9999] max-w-xs rounded border border-baoWhite border-opacity-20 bg-baoBlack px-2 py-1 text-center',
				className,
			)}
		>
			{children || (
				<span>
					<FontAwesomeIcon
						icon={faQuestionCircle as IconProp}
						className='text-baoWhite duration-200 hover:text-baoRed text-base align-top'
					/>
				</span>
			)}
		</Tooltip>
	</>
)

export default Tooltipped
export type { TooltippedProps }
