'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { AppTheme } from './theme.types';
import { darkTheme, THEMES } from './theme.constants';
import { GlobalStyles } from './GlobalStyles';

interface ThemeContextType {
  currentTheme: AppTheme;
  themeName: string;
  setThemeName: (name: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: darkTheme,
  themeName: 'dark',
  setThemeName: () => {},
  availableThemes: Object.keys(THEMES),
});

export const useAppTheme = () => useContext(ThemeContext);

interface AppThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
  initialTheme = 'dark',
}) => {
  const [themeName, setThemeName] = useState<string>(initialTheme);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('melodict_theme');
    if (saved && THEMES[saved]) {
      setThemeName(saved);
    }
  }, []);

  const handleSetTheme = (name: string) => {
    if (THEMES[name]) {
      setThemeName(name);
      localStorage.setItem('melodict_theme', name);
    }
  };

  const currentTheme = THEMES[themeName] || darkTheme;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        setThemeName: handleSetTheme,
        availableThemes: Object.keys(THEMES),
      }}
    >
      <StyledThemeProvider theme={currentTheme}>
        <GlobalStyles />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
