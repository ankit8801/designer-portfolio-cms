import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (preference) => {
      let resolvedTheme = preference;
      if (preference === 'system') {
        resolvedTheme = systemQuery.matches ? 'dark' : 'light';
      }

      setActiveTheme(resolvedTheme);
      root.setAttribute('data-theme', resolvedTheme);
    };

    applyTheme(themePreference);

    const handleSystemChange = () => {
      if (themePreference === 'system') {
        applyTheme('system');
      }
    };

    systemQuery.addEventListener('change', handleSystemChange);
    return () => systemQuery.removeEventListener('change', handleSystemChange);
  }, [themePreference]);

  const setTheme = (newTheme) => {
    setThemePreference(newTheme);
    if (newTheme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }
  };

  const contextValue = useMemo(
    () => ({ theme: themePreference, activeTheme, setTheme }),
    [themePreference, activeTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
