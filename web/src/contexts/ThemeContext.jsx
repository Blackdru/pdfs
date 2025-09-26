import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Single color mode - always light theme
  const [theme] = useState('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Ensure we're mounted before applying theme
    setMounted(true)
    
    // Apply light theme to document
    const root = window.document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
    
    // Remove any stored theme preference since we're using single mode
    localStorage.removeItem('theme')
  }, [])

  const value = {
    theme: 'light',
    isDark: false,
    isLight: true,
    mounted,
    // Deprecated methods for backward compatibility
    toggleTheme: () => {},
    setLightTheme: () => {},
    setDarkTheme: () => {},
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}