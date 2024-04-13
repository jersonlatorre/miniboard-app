import { createContext, useState } from 'react'

export const WorkspaceContext = createContext()

// eslint-disable-next-line react/prop-types
export const WorkspaceProvider = ({ children }) => {
  const [mainColor, setMainColor] = useState('#FFFFFF')
  const [eraserColor, setEraserColor] = useState('#111111')
  const [theme, setTheme] = useState('dark')
  // const [colors, setColors] = useState(['#FFD54B', '#FF8BF6', '#02AFFF'])
  const [colors, setColors] = useState(['#FFD602', '#FF6AC1', '#1360FF'])
  const [brushColor, setBrushColor] = useState(mainColor)

  return (
    <WorkspaceContext.Provider value={{ colors, brushColor, eraserColor, mainColor, theme, setColors, setBrushColor, setEraserColor, setMainColor, setTheme }}>
      {children}
    </WorkspaceContext.Provider>
  )
}
