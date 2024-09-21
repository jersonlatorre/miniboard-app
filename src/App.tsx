import React from 'react'
import Toolbar from './components/Toolbar'
import Whiteboard from './components/Whiteboard'
import { WorkspaceProvider } from './contexts/WorkspaceContext'

const App: React.FC = () => {
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
    }

    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <WorkspaceProvider>
      <Whiteboard />
      <Toolbar />
    </WorkspaceProvider>
  )
}

export default App
