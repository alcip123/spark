import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// One spring config for every tappable surface in the app, so press feedback
// feels identical everywhere. Press-in is stiff and quick (must track the
// finger); release is softer so the pop-back overshoots a touch. When the
// system Reduce Motion setting is on, the scale snaps instead of springing.
const PRESS_IN = { damping: 22, stiffness: 420, reduceMotion: ReduceMotion.System }
const RELEASE = { damping: 13, stiffness: 320, reduceMotion: ReduceMotion.System }
const PRESSED_SCALE = 0.93

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>
}

// Drop-in Pressable replacement: springs down on press, pops back on release.
// Scale only — no opacity change. Style must be a plain style (not the
// Pressable function form), which is all this codebase uses.
export function PressableScale({ style, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.value = withSpring(PRESSED_SCALE, PRESS_IN)
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, RELEASE)
        onPressOut?.(e)
      }}
    />
  )
}
