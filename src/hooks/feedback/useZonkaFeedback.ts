import { useEffect } from 'react'

const useZonkaFeedback = (workspaceId: any) => {
	useEffect(() => {
		// @ts-ignore
		window._zfQueue = window._zfQueue || []
		function _zf() {
			// @ts-ignore
			window._zfQueue.push(arguments)
		}

		// @ts-ignore
		window.ZonkaFeedback = function (en, fb) {
			document.body.addEventListener(en, fb, false)
		}

		const scriptId = 'zfEmbedScript'
		if (!document.getElementById(scriptId)) {
			const script = document.createElement('script')
			script.id = scriptId
			script.async = true
			script.src = `https://e-js.zonka.co/${workspaceId}`
			document.head.appendChild(script)
		}

		// Cleanup function
		return () => {
			const script = document.getElementById(scriptId)
			if (script && script.parentNode === document.head) {
				document.head.removeChild(script)
			}
			// Remove event listeners or other resources
		}
	}, [workspaceId])
}

export default useZonkaFeedback
