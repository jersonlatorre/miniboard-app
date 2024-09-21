import { WorkspaceContext } from '../contexts/WorkspaceContext'
import { useContext } from 'react'

export default function Toolbar() {
  const { colors, brushColor, setBrushColor, mainColor, eraserColor } = useContext(WorkspaceContext)

  const handleClick = (e: React.MouseEvent, color: string) => {
    e.stopPropagation()
    setBrushColor(color)
  }

  return (
    <ul className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex list-none p-[3px] m-0 bg-gray-300/50 rounded-full">
      <li
        className={`relative w-6 h-6 rounded-full cursor-pointer m-[5px] transition-transform duration-200 hover:scale-110 ${
          brushColor === mainColor
            ? 'bg-white/20 after:content-[""] after:absolute after:w-3 after:h-3 after:rounded-full after:bg-black/25 after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:pointer-events-none'
            : ''
        }`}
        style={{ backgroundColor: mainColor }}
        onClick={(e) => handleClick(e, mainColor)}
      ></li>
      {colors.map((color) => (
        <li
          className={`relative w-6 h-6 rounded-full cursor-pointer m-[5px] transition-transform duration-200 hover:scale-110 ${
            brushColor === color
              ? 'bg-white/20 after:content-[""] after:absolute after:w-3 after:h-3 after:rounded-full after:bg-black/25 after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:pointer-events-none'
              : ''
          }`}
          key={color}
          style={{ backgroundColor: color }}
          onClick={(e) => handleClick(e, color)}
        ></li>
      ))}
      <li
        className={`relative w-6 h-6 rounded-full cursor-pointer m-[5px] transition-transform duration-200 hover:scale-110 bg-[url('/eraser-dark.svg')] bg-no-repeat bg-center bg-[length:18px] ${
          brushColor === eraserColor ? 'bg-white/20' : ''
        }`}
        onClick={(e) => handleClick(e, eraserColor)}
      ></li>
    </ul>
  )
}
