/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/display-name */
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import React, { ReactNode, useMemo } from 'react'
import { PendingTransaction } from '../Loader/Loader'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const Size = {
	xs: 'rounded-full px-2 h-8',
	sm: 'rounded-full px-4 h-10',
	md: 'rounded-full px-6 h-12',
	lg: 'rounded-full px-8 h-16',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: ReactNode
	size?: ButtonSize
	fullWidth?: boolean
	width?: string | boolean
	pendingTx?: string | boolean
	txHash?: string
	inline?: boolean
	href?: string
	text?: any
	disabled?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ children, className = '', size = 'md', fullWidth = false, width = false, pendingTx, txHash, inline, text, href, disabled, ...rest },
		ref,
	) => {
		const ButtonChild = useMemo(() => {
			if (href) {
				return (
					<a href={href} target='_blank' rel='noreferrer' className='hover:text-baoWhite focus:text-baoWhite'>
						{text}
					</a>
				)
			} else {
				return text
			}
		}, [href, text])

		const isDisabled = useMemo(() => typeof pendingTx === 'string' || pendingTx || disabled === true, [disabled, pendingTx])

		const buttonText = children

		return !pendingTx ? (
			<button
				{...rest}
				ref={ref}
				disabled={isDisabled}
				className={classNames(
					// @ts-ignore TYPE NEEDS FIXING
					Size[size],
					inline ? 'inline-block' : 'flex',
					fullWidth ? 'w-full' : '',
					width ? width : 'w-fit',
					disabled ? 'cursor-not-allowed opacity-50' : '',
					`relative flex items-center justify-center overflow-hidden glassmorphic-card border border-baoWhite border-opacity-20
				bg-baoWhite bg-opacity-5 px-4 py-2 font-bakbak text-lg text-baoWhite duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20`,
					className,
				)}
			>
				<>
					{ButtonChild}
					{buttonText}
				</>
			</button>
		) : (
			<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
				<button
					{...rest}
					ref={ref}
					disabled={isDisabled}
					className={classNames(
						// @ts-ignore TYPE NEEDS FIXING
						Size[size],
						inline ? 'inline-block' : 'flex',
						fullWidth ? 'w-full' : '',
						disabled ? 'cursor-not-allowed opacity-50' : '',
						`relative flex w-fit items-center justify-center overflow-hidden rounded-full border border-baoWhite border-opacity-20
					bg-baoWhite bg-opacity-5 px-4 py-2 font-bakbak text-lg text-baoWhite duration-300 hover:border-baoRed hover:bg-baoRed hover:bg-opacity-20`,
						className,
					)}
				>
					<>
						<PendingTransaction /> Pending Transaction
						<FontAwesomeIcon icon={faExternalLink} className='ml-2 text-baoRed' />
					</>
				</button>
			</a>
		)
	},
)

export default Button

type NavButtonProps = {
	onClick: (s: any) => void
	active: string
	options: string[]
	className?: string
}

export const NavButtons = ({ options, active, onClick, className }: NavButtonProps) => {
	return (
		<div className='flex w-full cursor-pointer gap-2'>
			{options.map((option: string) => (
				<Button
					size='md'
					key={option}
					className={classNames(`${option === active && '!border-baoRed !bg-baoRed !bg-opacity-20'} w-full`, className)}
					onClick={() => onClick(option)}
				>
					{option}
				</Button>
			))}
		</div>
	)
}
