const defaultTheme = require('tailwindcss/defaultTheme')

const { screens } = defaultTheme

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
})

// @ts-check
/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	swcMinify: false,
	productionBrowserSourceMaps: false,
	images: {
		deviceSizes: [640, 768, 1024, 1280, 1536, 1600],
		unoptimized: true,
	},
	publicRuntimeConfig: {
		breakpoints: screens,
	},
	distDir: '.next',
}

module.exports = withBundleAnalyzer(nextConfig)
