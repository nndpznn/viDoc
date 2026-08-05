import { useState, useEffect } from 'react'

/** Viewport height in px. Always starts at 0 on server/client, then syncs after mount (hydration-safe). */
const useViewportHeight = (): number => {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => setHeight(window.innerHeight)
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return height
}

export default useViewportHeight
