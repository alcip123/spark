import { BlurView } from 'expo-blur'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { glass } from '../theme'

interface GlassSurfaceProps {
  variant: keyof typeof glass
  radius: number
  style?: StyleProp<ViewStyle>
}

// Decorative, absolutely-positioned blur layer — render as the first child
// of whatever Pressable/View it's backing, with the icon/content rendered
// after it so the content stays visually on top. pointerEvents="none" so
// this layer never intercepts the touch meant for its parent.
export function GlassSurface({ variant, radius, style }: GlassSurfaceProps) {
  const config = glass[variant]
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: radius,
          borderWidth: 1,
          borderColor: config.borderColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <BlurView intensity={config.intensity} tint={config.tint} style={StyleSheet.absoluteFill} />
    </View>
  )
}
