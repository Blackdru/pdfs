// Centralized theme configuration - Single Modern Theme
export const theme = {
  // Core color palette - Hardcoded Modern Blue-Purple Theme
  colors: {
    // Modern Blue-Purple Scale
    primary: {
      50: '#F0F5FF',
      100: '#E0EBFF',
      200: '#C7DCFF',
      300: '#A5C8FF',
      400: '#78AAFF',
      500: '#4F8CFF',
      600: '#3B78EB',
      700: '#2D5FC8',
      800: '#1E46A5',
      900: '#143282',
      950: '#0A1E50',
    },
    
    // Vibrant accent colors
    accent: {
      blue: '#3B8CFF',
      purple: '#9B64FF',
      cyan: '#22D3EE',
      pink: '#EC4899',
      green: '#34D399',
      orange: '#FB923C',
      red: '#F87171',
      yellow: '#FACC15',
    },
    
    // Semantic colors - Hardcoded
    background: '#0A0F1E',
    foreground: '#F8FAFC',
    surface: '#0F172A',
    border: '#1E293B',
    input: '#1E293B',
    ring: '#4F8CFF',
  },
  
  // Component-specific color mappings - Hardcoded
  components: {
    button: {
      default: {
        bg: '#3B8CFF',
        text: '#FFFFFF',
        hover: '#4F9CFF',
      },
      outline: {
        border: '#3B8CFF',
        text: '#A5C8FF',
        hover: {
          bg: '#143282',
          border: '#4F8CFF',
          text: '#C7DCFF',
        },
      },
      ghost: {
        text: '#A5C8FF',
        hover: {
          bg: '#1E293B',
          text: '#C7DCFF',
        },
      },
    },
    
    card: {
      bg: '#0F172A',
      border: '#1E293B',
      text: '#E0EBFF',
    },
    
    input: {
      bg: '#1E293B',
      border: '#2D5FC8',
      text: '#E0EBFF',
      placeholder: '#78AAFF',
      focus: {
        border: '#4F8CFF',
        ring: '#A5C8FF',
      },
    },
    
    dropdown: {
      bg: '#0F172A',
      border: '#1E293B',
      text: '#C7DCFF',
      item: {
        hover: {
          bg: '#1E293B',
          text: '#F8FAFC',
        },
      },
    },
    
    dialog: {
      overlay: 'rgba(10, 15, 30, 0.95)',
      bg: '#0F172A',
      border: '#1E293B',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      display: ['Poppins', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  // Border radius
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  
  // Shadows - Hardcoded with blue tint
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.8)',
    md: '0 4px 6px -1px rgba(59, 140, 255, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.9)',
    lg: '0 10px 15px -3px rgba(59, 140, 255, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.9)',
    xl: '0 20px 25px -5px rgba(59, 140, 255, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.9)',
    '2xl': '0 25px 50px -12px rgba(59, 140, 255, 0.6)',
  },
  
  // Gradients - Hardcoded
  gradients: {
    primary: 'linear-gradient(135deg, #3B8CFF 0%, #9B64FF 100%)',
    secondary: 'linear-gradient(135deg, #22D3EE 0%, #3B8CFF 100%)',
    accent: 'linear-gradient(135deg, #9B64FF 0%, #EC4899 100%)',
    surface: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    hero: 'linear-gradient(135deg, #3B8CFF 0%, #9B64FF 50%, #EC4899 100%)',
    card: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    blue: 'linear-gradient(135deg, #3B8CFF 0%, #22D3EE 100%)',
    purple: 'linear-gradient(135deg, #9B64FF 0%, #7C3AED 100%)',
    green: 'linear-gradient(135deg, #34D399 0%, #22C55E 100%)',
    orange: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
    red: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
  },
  
  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

// Utility functions for theme usage
export const getColor = (path) => {
  const keys = path.split('.')
  let value = theme.colors
  
  for (const key of keys) {
    value = value[key]
    if (!value) return null
  }
  
  return value
}

export const getComponentColor = (component, variant = 'default', state = 'default') => {
  const componentColors = theme.components[component]
  if (!componentColors) return null
  
  if (variant === 'default' && state === 'default') {
    return componentColors
  }
  
  const variantColors = componentColors[variant]
  if (!variantColors) return null
  
  if (state === 'default') {
    return variantColors
  }
  
  return variantColors[state] || variantColors
}

export default theme
