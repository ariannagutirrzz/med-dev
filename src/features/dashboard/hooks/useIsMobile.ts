import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const m = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
		setIsMobile(m.matches)

		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
		m.addEventListener("change", handler)
		return () => m.removeEventListener("change", handler)
	}, [])

	return isMobile
}
