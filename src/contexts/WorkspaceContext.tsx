import { ReactNode, createContext, useState } from 'react'

const MAIN_COLOR = '#FFFFFF'
const ERASER_COLOR = '#111111'
const PALETTE_COLORS = ['#FFD602', '#FF6AC1', '#1360FF']

interface WorkspaceContextType {
  colors: string[]
  brushColor: string
  eraserColor: string
  mainColor: string
  setBrushColor: (color: string) => void
}

export const WorkspaceContext = createContext<WorkspaceContextType>({} as WorkspaceContextType)

interface WorkspaceProviderProps {
  children: ReactNode
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
  const [brushColor, setBrushColor] = useState(MAIN_COLOR)

  return (
    <WorkspaceContext.Provider
      value={{
        colors: PALETTE_COLORS,
        brushColor,
        eraserColor: ERASER_COLOR,
        mainColor: MAIN_COLOR,
        setBrushColor,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
