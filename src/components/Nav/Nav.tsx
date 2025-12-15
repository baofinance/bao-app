import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import { useWeb3React } from '@web3-react/core'

interface NavLinkProps {
	href?: string
	className?: string
	exact?: boolean
}

const Nav: FC<NavLinkProps> = ({ href, exact }) => {
	const { pathname } = useRouter()
	const { chainId } = useWeb3React()
	const isActive = exact ? pathname === href : pathname.startsWith(href)
	const [hoveredIndex, setHoveredIndex] = useState(null)

	// if (isActive) {
	// 	className += 'active'
	// }

	const allNavigation = [
		['0', 'BORROW', '/vaults'],
		['1', 'STAKE', '/stake'],
		['2', 'SWAP', '/swap'],
		['3', 'EARN', '/earn'],
		['4', 'VEBAO', '/vebao'],
		['5', 'LEND', '/lend'],
		['6', 'DISTRIBUTION', '/distribution'],
		['7', 'CLAIM', '/claim'],
		['8', 'BASKETS', '/baskets'],
	]

	// On Polygon (137), only show Baskets. On Ethereum (1) or undefined, show all except STAKE and LEND
	const navigation =
		chainId === 137
			? allNavigation.filter(item => item[1] === 'BASKETS')
			: allNavigation.filter(item => item[1] !== 'STAKE' && item[1] !== 'LEND')

	return (
		<>
			{navigation.map(([index, name, href]) => (
				<Link
					href={href}
					key={name}
					className='relative -mx-3 -my-2 rounded px-3 py-2 font-bakbak text-xl transition-colors delay-150 hover:delay-[0ms]'
					onMouseEnter={() => setHoveredIndex(index as any)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<AnimatePresence>
						{hoveredIndex === index && (
							<motion.span
								className={`absolute inset-0 rounded bg-baoRed`}
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
					<span className={`relative z-10 ${isActive && 'bg-baoRed'}`}>{name}</span>
				</Link>
			))}
		</>
	)
}

export default Nav
