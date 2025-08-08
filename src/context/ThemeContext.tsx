import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'classic' | 'modern';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('petport-theme') as Theme;
    return savedTheme || 'classic';
  });

  useEffect(() => {
    localStorage.setItem('petport-theme', theme);
    
    // Apply theme class to document root
    const root = document.documentElement;
    root.classList.remove('theme-classic', 'theme-modern');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'classic' ? 'modern' : 'classic');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};