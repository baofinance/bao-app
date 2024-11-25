import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const Nav: FC = () => {
	const router = useRouter()
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

	const navItems = [
		{ name: 'STAKE', href: '/stake' },
		{ name: 'SWAP', href: '/swap' },
		{ name: 'EARN', href: '/earn' },
		{ name: 'VEBAO', href: '/vebao' },
		{ name: 'LEND', href: '/lend' },
	]

	return (
		<nav className='flex items-center gap-8'>
			{navItems.map((item, index) => (
				<Link
					key={item.name}
					href={item.href}
					className='relative -mx-3 -my-2 rounded px-3 py-2 text-xl'
					onMouseEnter={() => setHoveredIndex(index)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<div className='relative w-full h-full flex items-center'>
						<AnimatePresence>
							{hoveredIndex === index && (
								<motion.span
									className='absolute inset-0 border border-baoRed rounded'
									layoutId='hoverBackground'
									initial={{ opacity: 0 }}
									animate={{
										opacity: 1,
										transition: { duration: 0.15 },
									}}
									exit={{
										opacity: 0,
										transition: { duration: 0.15, delay: 0.2 },
									}}
								/>
							)}
						</AnimatePresence>
						<span
							className={`relative z-10 font-bakbak transition-colors duration-200 cursor-pointer
								${router.pathname === item.href ? 'text-baoRed' : 'text-baoWhite hover:text-baoRed'}`}
						>
							{item.name}
						</span>
					</div>
				</Link>
			))}
		</nav>
	)
}

export default Nav
