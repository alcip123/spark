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
          // Base fill sits under the blur: Spark's background is a flat,
          // uniform color with nothing scrolling behind these surfaces, so
          // blurring it alone returns ~the same flat color (nearly
          // invisible). This translucent bgAlt layer is what actually gives
          // the surface presence — the blur then adds a soft frosted quality
          // on top of/blended with it. See the `glass` token comment in
          // theme.ts for the exact values.
          backgroundColor: config.baseFill,
        },
        style,
      ]}
    >
      <BlurView
        intensity={config.intensity}
        tint={config.tint}
        style={StyleSheet.absoluteFill}
        // expo-blur's BlurView has no real blur on Android by default
        // (`blurMethod` defaults to 'none', rendering a flat
        // translucent overlay instead). 'dimezisBlurView' enables true blur
        // there via a maintained third-party implementation expo-blur
        // bundles support for. If it ever regresses (it's still marked
        // experimental upstream), Android falls back to the flat overlay —
        // with `baseFill` above now in place, that degrades gracefully to
        // "translucent surface, no blur" rather than "invisible surface",
        // so this is an accepted platform tradeoff either way, not a bug.
        blurMethod="dimezisBlurView"
      />
    </View>
  )
}
