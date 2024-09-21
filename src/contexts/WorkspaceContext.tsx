import { ReactNode, createContext, useState } from 'react'

interface WorkspaceContextType {
  colors: string[]
  brushColor: string
  eraserColor: string
  mainColor: string
  theme: string
  setColors: (colors: string[]) => void
  setBrushColor: (color: string) => void
  setEraserColor: (color: string) => void
  setMainColor: (color: string) => void
  setTheme: (theme: string) => void
}

export const WorkspaceContext = createContext<WorkspaceContextType>({} as WorkspaceContextType)

interface WorkspaceProviderProps {
  children: ReactNode
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
  const [mainColor, setMainColor] = useState('#FFFFFF')
  const [eraserColor, setEraserColor] = useState('#111111')
  const [theme, setTheme] = useState('dark')
  const [colors, setColors] = useState(['#FFD602', '#FF6AC1', '#1360FF'])
  const [brushColor, setBrushColor] = useState(mainColor)

  return (
    <WorkspaceContext.Provider
      value={{
        colors,
        brushColor,
        eraserColor,
        mainColor,
        theme,
        setColors,
        setBrushColor,
        setEraserColor,
        setMainColor,
        setTheme,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
