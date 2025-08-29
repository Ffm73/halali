import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ReturnType<typeof getThemedColors>;
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  
  const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';
  const colors = getThemedColors(isDark);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = (await AsyncStorage.getItem('themeMode')) as ThemeMode || 'system';
        setMode(savedMode);
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);


  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setMode(mode);
      
      console.log('✅ Theme changed to:', mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setThemeMode(newMode);
  };

  return {
    mode,
    isDark,
    colors,
    setThemeMode,
    toggleTheme,
  };
}