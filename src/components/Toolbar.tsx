import { WorkspaceContext } from '../contexts/WorkspaceContext'
import { useContext } from 'react'

export default function Toolbar() {
  const { colors, brushColor, setBrushColor, mainColor, eraserColor } = useContext(WorkspaceContext)

  const handleClick = (e: React.MouseEvent<HTMLLIElement>, color: string) => {
    e.stopPropagation()
    setBrushColor(color)
  }

  const renderColorOption = (color: string, isEraser: boolean = false) => {
    const isSelected = brushColor === color
    const baseClasses =
      'relative w-6 h-6 rounded-full cursor-pointer m-[5px] transition-transform duration-200 hover:scale-110'
    const selectedClasses = isSelected ? 'bg-white/20' : ''
    const eraserClasses = isEraser ? 'bg-[url("/eraser-dark.svg")] bg-no-repeat bg-center bg-[length:18px]' : ''
    const afterClasses =
      isSelected && !isEraser
        ? 'after:content-[""] after:absolute after:w-3 after:h-3 after:rounded-full after:bg-black/25 after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:pointer-events-none'
        : ''

    return (
      <li
        className={`${baseClasses} ${selectedClasses} ${eraserClasses} ${afterClasses}`}
        style={{ backgroundColor: isEraser ? undefined : color }}
        onClick={(e) => handleClick(e, color)}
        key={color}
      ></li>
    )
  }

  return (
    <ul className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex list-none p-[3px] m-0 bg-gray-300/50 rounded-full">
      {renderColorOption(mainColor)}
      {colors.map((color) => renderColorOption(color))}
      {renderColorOption(eraserColor, true)}
    </ul>
  )
}
