import { createContext, useState } from 'react'

import PropTypes from 'prop-types'

export const WorkspaceContext = createContext()

export const WorkspaceProvider = ({ children }) => {
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

WorkspaceProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
