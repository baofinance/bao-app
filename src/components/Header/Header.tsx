import Logo from '@/components/Logo'
import { faDiscord, faGithub, faMedium, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faBolt, faBook, faEllipsisVertical, faVoteYea, faCircleArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu, Popover, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { FC, Fragment, ReactNode } from 'react'
import AccountButton from '../AccountButton'
import Container from '../Container'
import Nav from '../Nav'

export interface IconProps {
	color?: string
	children?: ReactNode
	size?: number
	className?: string
}

export interface MobileNavLinkProps {
	href: string
	target?: string
	children?: ReactNode
}

const MobileNavLink: FC<MobileNavLinkProps> = ({ href, children, target, ...props }) => {
	return (
		<Popover.Button
			as={Link}
			href={href}
			target={target}
			className='block font-bakbak text-lg leading-7 tracking-tight text-baoWhite'
			{...props}
		>
			{children}
		</Popover.Button>
	)
}

const Header: FC = () => {
	return (
		<header>
			<nav>
				<Container className='relative z-50 flex !max-w-full justify-between pb-8 pt-3'>
					<div className='relative z-10 flex items-center gap-3'>
						<Link href='/' aria-label='Home'>
							<Logo className='h-10 w-auto' />
						</Link>
						{/* <h1 className='font-bakbak text-xl'>
							TVL: {tvl}
						</h1> */}
					</div>
					<div className='flex items-center gap-2'>
						<div className='hidden gap-6 lg:flex mr-2'>
							<Nav />
						</div>
						<AccountButton />
						<Popover className='block lg:hidden'>
							{({ open }) => (
								<>
									<Popover.Button
										className='relative z-10 inline-flex h-[40px] w-[40px] items-center stroke-baoWhite p-2 active:stroke-gray-900 [&:not(:focus-visible)]:focus:outline-none'
										aria-label='Toggle site navigation'
									>
										<div className='flex flex-col items-center justify-center'>
											<span
												className={`block h-0.5 w-6 rounded-sm bg-baoWhite 
                    transition-all duration-300 ease-out ${open ? 'translate-y-1 rotate-45' : '-translate-y-0.5'}`}
											></span>
											<span
												className={`my-0.5 block h-0.5 w-6 rounded-sm bg-baoWhite transition-all duration-300 ease-out ${
													open ? 'opacity-0' : 'opacity-100'
												}`}
											></span>
											<span
												className={`block h-0.5 w-6 rounded-sm bg-baoWhite 
                    transition-all duration-300 ease-out ${open ? '-translate-y-1 -rotate-45' : 'translate-y-0.5'}`}
											></span>
										</div>
									</Popover.Button>
									<AnimatePresence initial={false}>
										{open && (
											<>
												<Popover.Overlay
													static
													as={motion.div}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													className='fixed inset-0 z-0 bg-baoBlack/60 backdrop-blur'
												/>
												<Popover.Panel
													static
													as={motion.div}
													initial={{ opacity: 0, y: -32 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{
														opacity: 0,
														y: -32,
														transition: { duration: 0.2 },
													}}
													className='absolute inset-x-0 top-0 z-0 origin-top rounded-b-2xl bg-baoBlack px-6 pb-6 pt-32 shadow-2xl shadow-gray-900/20'
												>
													<div className='space-y-4'>
														<MobileNavLink href='/vaults'>VAULTS</MobileNavLink>
														{/* <MobileNavLink href='/stake'>STAKE</MobileNavLink> */}
														<MobileNavLink href='/swap'>SWAP</MobileNavLink>
														<MobileNavLink href='/earn'>EARN</MobileNavLink>
														<MobileNavLink href='/vebao'>VEBAO</MobileNavLink>
														{/* <MobileNavLink href='/lend'>LEND</MobileNavLink> */}
														<MobileNavLink href='/distribution'>DISTRIBUTION</MobileNavLink>
														<MobileNavLink href='/claim'>CLAIM</MobileNavLink>
													</div>
												</Popover.Panel>
											</>
										)}
									</AnimatePresence>
								</>
							)}
						</Popover>

						{/* {baov1Balance.gt(0) && <MigrateButton />} */}

						<Menu as='div' className='relative !z-[9999] hidden text-left lg:inline-block'>
							<Menu.Button className='h-10 rounded'>
								<span className='sr-only'>Open options</span>
								<FontAwesomeIcon icon={faEllipsisVertical} className='h-5 w-5 text-baoWhite' aria-hidden='true' />
							</Menu.Button>

							<Transition
								as={Fragment}
								enter='transition ease-out duration-100'
								enterFrom='transform opacity-0 scale-95'
								enterTo='transform opacity-100 scale-100'
								leave='transition ease-in duration-75'
								leaveFrom='transform opacity-100 scale-100'
								leaveTo='transform opacity-0 scale-95'
							>
								<Menu.Items className='absolute right-0 !z-[9999] mt-2 w-fit origin-top-right glassmorphic-card ring-1 ring-baoBlack ring-opacity-5 focus:outline-none'>
									<div className='z-[9999] py-1'>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://docs.bao.finance'
													aria-label='Documentation'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Documentation <FontAwesomeIcon icon={faBook} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://gov.bao.finance'
													aria-label='Governance Forums'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Governance <FontAwesomeIcon icon={faVoteYea} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://snapshot.org/#/baovotes.eth/'
													aria-label='Snapshot'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Snapshot <FontAwesomeIcon icon={faBolt} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://discord.gg/BW3P62vJXT'
													aria-label='Discord'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Discord <FontAwesomeIcon icon={faDiscord} className='text-end' />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://github.com/baofinance'
													aria-label='GitHub'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													GitHub <FontAwesomeIcon icon={faGithub} />
												</a>
											)}
										</Menu.Item>
										{/* <Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://www.immunefi.com/bounty/baofinance'
													aria-label='Immunefi'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Immunefi <FontAwesomeIcon icon={faBug} />
												</a>
											)}
										</Menu.Item> */}
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://twitter.com/BaoCommunity'
													aria-label='Twitter'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Twitter <FontAwesomeIcon icon={faTwitter} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://medium.com/baomunity'
													aria-label='Medium'
													rel='noreferrer'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Medium <FontAwesomeIcon icon={faMedium} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													href='/backstops'
													aria-label='Backstops'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Backstops <FontAwesomeIcon icon={faCircleArrowRight} />
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													href='/ballast'
													aria-label='Ballast'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Ballast <FontAwesomeIcon icon={faCircleArrowRight} />
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													href='/baskets'
													aria-label='Baskets'
													className={classNames(
														active ? 'text-baoRed' : 'text-baoWhite',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Baskets <FontAwesomeIcon icon={faCircleArrowRight} />
												</Link>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
					</div>
				</Container>
			</nav>
		</header>
	)
}
export default Header
