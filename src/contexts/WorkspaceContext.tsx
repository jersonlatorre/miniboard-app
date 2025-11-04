import { ReactNode, createContext, useState } from 'react'

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
  const mainColor = '#FFFFFF'
  const eraserColor = '#111111'
  const colors = ['#FFD602', '#FF6AC1', '#1360FF']
  const [brushColor, setBrushColor] = useState(mainColor)

  return (
    <WorkspaceContext.Provider
      value={{
        colors,
        brushColor,
        eraserColor,
        mainColor,
        setBrushColor,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
