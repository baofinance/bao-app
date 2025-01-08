import React, { useState } from 'react'
import {
	useFloating,
	useInteractions,
	useHover,
	offset,
	flip,
	shift,
	FloatingPortal,
	arrow,
	autoUpdate,
	Strategy,
} from '@floating-ui/react'

interface TooltipProps {
	content: React.ReactNode
	children: React.ReactElement
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null)

	const { refs, strategy, x, y, context, middlewareData } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		middleware: [
			offset(8),
			flip({
				fallbackAxisSideDirection: 'start',
				padding: 5,
			}),
			shift({ padding: 5 }),
			arrow({ element: arrowRef }),
		],
		whileElementsMounted: autoUpdate,
		placement: 'top',
	})

	const hover = useHover(context, {
		move: false,
		delay: { open: 100, close: 200 },
	})
	const { getReferenceProps, getFloatingProps } = useInteractions([hover])

	return (
		<div className='relative inline-block'>
			<div ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</div>
			{isOpen && (
				<div
					ref={refs.setFloating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
						width: 'max-content',
					}}
					{...getFloatingProps()}
					className='absolute z-[9999]'
				>
					<div className='bg-baoBlack border border-baoWhite/10 text-baoWhite rounded-lg px-3 py-2 text-sm shadow-lg backdrop-blur-sm'>
						{content}
						<div
							ref={setArrowRef}
							className='absolute bg-baoBlack border-baoWhite/10 w-2 h-2 rotate-45 border-l border-t'
							style={{
								left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
								top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
								right: '',
								bottom: '',
								[context.placement.includes('top') ? 'bottom' : 'top']: '-4px',
							}}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
