import './App.scss'

import Toolbar from './components/Toolbar'
import Whiteboard from './components/Whiteboard'
import { WorkspaceProvider } from './contexts/WorkspaceContext'

export default function App() {
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault()
  })
  document.addEventListener(
    'wheel',
    function (e) {
      e.preventDefault()
    },
    { passive: false }
  )

  return (
    <WorkspaceProvider>
      <Whiteboard />
      <Toolbar />
    </WorkspaceProvider>
  )
}
