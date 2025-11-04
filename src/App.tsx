import { useState, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import Whiteboard from './components/Whiteboard'
import Toast from './components/Toast'
import { WorkspaceProvider } from './contexts/WorkspaceContext'

const App = () => {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
    }

    const handleImageSaved = () => {
      setShowToast(true)
    }

    document.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('imageSaved', handleImageSaved)

    return () => {
      document.removeEventListener('wheel', handleWheel)
      window.removeEventListener('imageSaved', handleImageSaved)
    }
  }, [])

  return (
    <WorkspaceProvider>
      <Whiteboard />
      <Toolbar />
      {showToast && (
        <Toast
          message="Imagen guardada exitosamente"
          onClose={() => setShowToast(false)}
        />
      )}
    </WorkspaceProvider>
  )
}

export default App
