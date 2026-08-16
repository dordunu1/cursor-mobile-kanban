import { Platform } from 'react-native'

export type AppThemeMode = 'light' | 'dark'

export type ThemeColors = {
  mode: AppThemeMode
  accent: string
  accentStrong: string
  accentDeep: string
  accentSoft: string
  accentInk: string
  bg0: string
  bg1: string
  surface: string
  surfaceElevated: string
  text: string
  textSecondary: string
  textTertiary: string
  danger: string
  success: string
  info: string
  border: string
  shadow: string
  overlay: string
  chip: string
  materialPrimaryContainer?: string
  materialSecondaryContainer?: string
}

const lightBase: ThemeColors = {
  mode: 'light',
  accent: '#2f6bff',
  accentStrong: '#3b75ff',
  accentDeep: '#2a5ef0',
  accentSoft: 'rgba(47, 107, 255, 0.12)',
  accentInk: '#ffffff',
  bg0: '#f3f5fb',
  bg1: '#ffffff',
  surface: 'rgba(255, 255, 255, 0.62)',
  surfaceElevated: 'rgba(255, 255, 255, 0.88)',
  text: '#171717',
  textSecondary: '#525252',
  textTertiary: '#737373',
  danger: '#ff5c7a',
  success: '#1f9d6a',
  info: '#7c6cff',
  border: 'rgba(255, 255, 255, 0.72)',
  shadow: 'rgba(47, 107, 255, 0.14)',
  overlay: 'rgba(8, 16, 40, 0.4)',
  chip: 'rgba(47, 107, 255, 0.1)',
  materialPrimaryContainer: '#d8e2ff',
  materialSecondaryContainer: '#e8def8',
}

const darkBase: ThemeColors = {
  mode: 'dark',
  accent: '#3b75ff',
  accentStrong: '#5b8dff',
  accentDeep: '#2f6bff',
  accentSoft: 'rgba(59, 117, 255, 0.2)',
  accentInk: '#ffffff',
  bg0: '#070b18',
  bg1: '#0c1224',
  surface: 'rgba(18, 32, 68, 0.72)',
  surfaceElevated: 'rgba(22, 36, 78, 0.92)',
  text: '#f4f7ff',
  textSecondary: '#b4bdd8',
  textTertiary: '#7d87a8',
  danger: '#ff5c7a',
  success: '#1f9d6a',
  info: '#7c6cff',
  border: 'rgba(255, 255, 255, 0.18)',
  shadow: 'rgba(0, 0, 0, 0.45)',
  overlay: 'rgba(0, 0, 0, 0.55)',
  chip: 'rgba(59, 117, 255, 0.18)',
  materialPrimaryContainer: '#1d3a7a',
  materialSecondaryContainer: '#3a2f5c',
}

export function getTheme(mode: AppThemeMode): ThemeColors {
  const base = mode === 'dark' ? darkBase : lightBase
  if (Platform.OS === 'android') {
    return {
      ...base,
      surface: mode === 'dark' ? '#152038' : '#eef1f8',
      surfaceElevated: mode === 'dark' ? '#1c2a48' : '#ffffff',
      border: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(23,23,23,0.08)',
      bg0: mode === 'dark' ? '#0b1020' : '#f0f2f8',
    }
  }
  return base
}

export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'
