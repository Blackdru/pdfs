import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme, mounted } = useTheme()

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-xl bg-grey-800 border border-grey-700 transition-all duration-300"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-2 rounded-xl bg-card border border-border hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon for Light Mode */}
        <Sun
          className={`absolute inset-0 w-5 h-5 text-accent-orange transition-all duration-300 ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-0'
          }`}
        />
        {/* Moon Icon for Dark Mode */}
        <Moon
          className={`absolute inset-0 w-5 h-5 text-accent-blue transition-all duration-300 ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  )
}

export default ThemeToggle
