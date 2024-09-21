import { ReactP5Wrapper } from '@p5-wrapper/react'
import { WorkspaceContext } from '../contexts/WorkspaceContext'
import { sketch } from '../scripts/sketch'
import { useContext } from 'react'

export default function Whiteboard() {
  const { brushColor, eraserColor } = useContext(WorkspaceContext)

  return (
    <div id="whiteboard" className="w-screen h-screen bg-white overflow-hidden" style={{ backgroundColor: '#111' }}>
      <ReactP5Wrapper sketch={sketch} brushColor={brushColor} eraserColor={eraserColor} />
    </div>
  )
}
