import './Toolbar.scss'

import { WorkspaceContext } from '../contexts/WorkspaceContext'
import { useContext } from 'react'

export default function Toolbar() {
  const { colors, brushColor, setBrushColor, mainColor, eraserColor } = useContext(WorkspaceContext)

  const handleClick = (e, color) => {
    e.stopPropagation()
    setBrushColor(color)
  }
  return (
    <ul id="toolbar">
      <li className={'button' + (brushColor === mainColor ? ' selected' : '')} style={{ backgroundColor: mainColor }} onClick={(e) => handleClick(e, mainColor)}></li>
      {colors.map((color) => (
        <li className={'button' + (brushColor === color ? ' selected' : '')} key={color} style={{ backgroundColor: color }} onClick={(e) => handleClick(e, color)}></li>
      ))}
      <li className={'eraser' + (brushColor === eraserColor ? ' selected' : '')} onClick={(e) => handleClick(e, eraserColor)}></li>
    </ul>
  )
}
