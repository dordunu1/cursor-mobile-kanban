import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { isAndroid, isIOS, type ThemeColors } from '../theme'

export function AppBackground({
  theme,
  children,
}: {
  theme: ThemeColors
  children: ReactNode
}) {
  if (isAndroid) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.bg0 }]}>
        <View
          style={[
            styles.androidBlob,
            { backgroundColor: theme.materialPrimaryContainer, top: 40, left: -40 },
          ]}
        />
        <View
          style={[
            styles.androidBlob,
            {
              backgroundColor: theme.materialSecondaryContainer,
              bottom: 120,
              right: -30,
              width: 220,
              height: 220,
            },
          ]}
        />
        <View style={styles.fill}>{children}</View>
      </View>
    )
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.bg0 }]}>
      <LinearGradient
        colors={
          theme.mode === 'dark'
            ? ['#0c1224', '#101a38', '#070b18']
            : ['#eef3ff', '#f6f5f2', '#e8f1ff']
        }
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, styles.orbA, { backgroundColor: theme.accent }]} />
      <View style={[styles.orb, styles.orbB, { backgroundColor: theme.info }]} />
      <View style={styles.fill}>{children}</View>
    </View>
  )
}

export function Surface({
  theme,
  children,
  style,
  intensity = 28,
}: {
  theme: ThemeColors
  children: ReactNode
  style?: StyleProp<ViewStyle>
  intensity?: number
}) {
  if (isIOS) {
    return (
      <View style={[styles.glassShell, { borderColor: theme.border, shadowColor: theme.shadow }, style]}>
        <BlurView intensity={intensity} tint={theme.mode === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[styles.glassFill, { backgroundColor: theme.surface }]} />
        <View style={styles.glassContent}>{children}</View>
      </View>
    )
  }

  return (
    <View
      style={[
        styles.materialCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  androidBlob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.55,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.28,
  },
  orbA: {
    width: 280,
    height: 280,
    top: -40,
    left: -60,
  },
  orbB: {
    width: 240,
    height: 240,
    top: 180,
    right: -70,
  },
  glassShell: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  glassFill: {
    ...StyleSheet.absoluteFill,
  },
  glassContent: {
    position: 'relative',
  },
  materialCard: {
    borderRadius: 28,
    borderWidth: 1,
    elevation: 3,
    overflow: 'hidden',
  },
})
