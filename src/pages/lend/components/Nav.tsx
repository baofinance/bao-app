import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'

interface NavLinkProps {
	href?: string
	className?: string
	exact?: boolean
}

const Nav: FC<NavLinkProps> = ({ href, exact }) => {
	const { pathname } = useRouter()
	const isActive = exact ? pathname === href : pathname.startsWith(href)
	const [hoveredIndex, setHoveredIndex] = useState(null)

	const navigation = [
		['0', 'BORROW', '/vaults'],
		['1', 'STAKE', '/stake'],
		['2', 'SWAP', '/swap'],
		['3', 'EARN', '/earn'],
		['4', 'VEBAO', '/vebao'],
		['5', 'LEND', '/lend'],
	]

	return (
		<>
			{navigation.map(([index, name, href]) => (
				<Link
					href={href}
					key={name}
					className='relative -mx-3 -my-2 rounded px-3 py-2 text-xl transition-colors delay-150 hover:delay-[0ms]'
					onMouseEnter={() => setHoveredIndex(index as any)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<div className='relative w-full h-full flex items-center justify-center px-2 py-1'>
						<AnimatePresence>
							{hoveredIndex === index && (
								<motion.span
									className='absolute inset-0 rounded bg-baoRed'
									layoutId='hoverBackground'
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: { duration: 0.15 } }}
									exit={{
										opacity: 0,
										transition: { duration: 0.15, delay: 0.2 },
									}}
								/>
							)}
						</AnimatePresence>
						<span className={`relative z-10 font-bakbak text-xl ${isActive ? 'bg-baoRed px-2 py-1 rounded' : ''}`}>{name}</span>
					</div>
				</Link>
			))}
		</>
	)
}

export default Nav
