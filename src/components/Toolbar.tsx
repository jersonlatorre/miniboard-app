import { useContext } from 'react'
import { WorkspaceContext } from '../contexts/WorkspaceContext'

export default function Toolbar() {
  const { colors, brushColor, setBrushColor, mainColor, eraserColor } = useContext(WorkspaceContext)

  const handleClick = (e: React.MouseEvent<HTMLLIElement>, color: string) => {
    e.stopPropagation()
    setBrushColor(color)
  }

  const renderColorOption = (color: string, isEraser: boolean = false) => {
    const isSelected = brushColor === color
    const classNames = [
      'relative w-6 h-6 rounded-full cursor-pointer m-[5px]',
      'transition-transform duration-200 hover:scale-110',
      isSelected && 'bg-white/20',
      isEraser && 'bg-[url("/eraser-dark.svg")] bg-no-repeat bg-center bg-[length:18px]',
      isSelected &&
        !isEraser &&
        'after:content-[""] after:absolute after:w-3 after:h-3 after:rounded-full after:bg-black/25 after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:pointer-events-none',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <li
        className={classNames}
        style={{ backgroundColor: isEraser ? undefined : color }}
        onClick={(e) => handleClick(e, color)}
      />
    )
  }

  return (
    <ul className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex list-none p-[3px] m-0 bg-gray-300/50 rounded-full">
      {renderColorOption(mainColor)}
      {colors.map((color) => (
        <li
          key={color}
          className={[
            'relative w-6 h-6 rounded-full cursor-pointer m-[5px]',
            'transition-transform duration-200 hover:scale-110',
            brushColor === color && 'bg-white/20',
            brushColor === color &&
              'after:content-[""] after:absolute after:w-3 after:h-3 after:rounded-full after:bg-black/25 after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:pointer-events-none',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ backgroundColor: color }}
          onClick={(e) => handleClick(e, color)}
        />
      ))}
      {renderColorOption(eraserColor, true)}
    </ul>
  )
}
