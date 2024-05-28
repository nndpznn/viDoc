import { useState, useEffect } from 'react'

// Custom hook name useViewportHeight
const useViewportHeight = (): number => {
  // State to store the viewport height
  const [height, setHeight] = useState<number>(0)

  // Handler to update the viewport height
  const updateHeight = () => {
    setHeight(window.innerHeight)
  }

  useEffect(() => {
    // Set initial height
    updateHeight()

    // Add resize event listener to update the height when the viewport changes
    window.addEventListener('resize', updateHeight)

    // Clean up the event listener on component unmount
    return () => window.removeEventListener('resize', updateHeight)
  }, []) // Empty dependency array means this effect runs once on mount

  return height
}

export default useViewportHeight
