import { useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { LAYERS, ROOK_PLACEMENT } from './sceneAssets'

// The seam between the onboarding sequence and however Rook is rendered.
//
// The sequence only ever says WHAT Rook is doing (`pose`); this component
// decides how. Today that is the existing rook.png with whole-container motion
// only. The production target is a Rive rig (idle, blink, lookUser, lookGlow,
// curiousTilt, notice, turnAway, hopForward, land, turnBack, greet, talkIdle as
// state-machine inputs); a RiveRook with this same props shape replaces this
// file's body without touching OnboardingScene. Rive is intentionally NOT
// installed yet — it needs a dev build and would break Expo Go — and Spark must
// never depend on it to boot, so the static Rook below stays as the fallback.
//
// Camera / parallax / position-in-the-room is NOT done here (that's the scene's
// job, in Reanimated); this component owns only Rook's own movement.

export type RookPose =
  | 'idle'
  | 'lookUser'
  | 'lookGlow'
  | 'curiousTilt'
  | 'notice'
  | 'turnAway'
  | 'hopForward'
  | 'land'
  | 'turnBack'
  | 'greet'
  | 'talkIdle'

interface RookCharacterProps {
  /** Rook's rendered width in px. */
  width: number
  pose: RookPose
  reducedMotion: boolean
}

// All idle amplitudes in one place. Near-stillness is the goal: these are
// ceilings, and most of the time Rook just rests.
const IDLE = {
  breatheScale: 1.006, // < 1% — almost imperceptible
  breatheMs: 4800,
  microTiltDeg: 1.1,
  microTiltMinGapMs: 6500,
  microTiltMaxGapMs: 11000,
}

export function RookCharacter({ width, pose, reducedMotion }: RookCharacterProps) {
  const height = width * ROOK_PLACEMENT.aspect
  const breathe = useSharedValue(1)
  const tilt = useSharedValue(0)
  const squashY = useSharedValue(1)
  const lift = useSharedValue(0)

  // Breathing: a single slow, tiny loop.
  useEffect(() => {
    if (reducedMotion) {
      breathe.value = 1
      return
    }
    breathe.value = withRepeat(
      withTiming(IDLE.breatheScale, { duration: IDLE.breatheMs, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )
    return () => cancelAnimation(breathe)
  }, [breathe, reducedMotion])

  // Occasional micro-behaviour at irregular intervals, long rests between.
  useEffect(() => {
    if (reducedMotion) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      const gap = IDLE.microTiltMinGapMs + Math.random() * (IDLE.microTiltMaxGapMs - IDLE.microTiltMinGapMs)
      timer = setTimeout(() => {
        const dir = Math.random() < 0.5 ? -1 : 1
        tilt.value = withSequence(
          withTiming(dir * IDLE.microTiltDeg, { duration: 900, easing: Easing.inOut(Easing.cubic) }),
          withDelay(500, withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.cubic) }))
        )
        schedule()
      }, gap)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [tilt, reducedMotion])

  // Pose triggers. Only poses the static PNG can express honestly are handled
  // here; the rest are deliberate no-ops until the Rive rig exists (we do not
  // distort the PNG to fake a head turn, eye movement or blink).
  useEffect(() => {
    const spring = { damping: 14, stiffness: 260, reduceMotion: ReduceMotion.System }
    switch (pose) {
      case 'notice':
        // A small start — the closest container-level read of "noticed something".
        tilt.value = withSequence(
          withTiming(-2, { duration: 160, easing: Easing.out(Easing.cubic) }),
          withDelay(260, withTiming(0, { duration: 420, easing: Easing.inOut(Easing.cubic) }))
        )
        break
      case 'curiousTilt':
        tilt.value = withSequence(
          withTiming(3, { duration: 280, easing: Easing.out(Easing.cubic) }),
          withDelay(700, withTiming(0, { duration: 600, easing: Easing.inOut(Easing.cubic) }))
        )
        break
      case 'land':
        squashY.value = withSequence(
          withTiming(0.96, { duration: 90, easing: Easing.out(Easing.quad) }),
          withSpring(1, spring)
        )
        break
      case 'greet':
        lift.value = withSequence(
          withTiming(-4, { duration: 160, easing: Easing.out(Easing.cubic) }),
          withSpring(0, spring)
        )
        break
      // TEMP: needs Rive rig — lookUser, lookGlow, turnAway, hopForward (the
      // hop's translation is driven by the scene), turnBack, talkIdle.
      default:
        break
    }
  }, [pose, tilt, squashY, lift])

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value },
      { rotate: `${tilt.value}deg` },
      { scaleX: breathe.value },
      { scaleY: breathe.value * squashY.value },
    ],
  }))

  return (
    <View style={{ width, height }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {/* Contact shadow: tells the eye Rook exists in the room, not on top of it. */}
      <View style={[styles.shadow, { width: width * 0.62, left: width * 0.19, bottom: -height * 0.012 }]} />
      {/* transformOrigin at the feet so breathing/squash never lifts him off the ledge. */}
      <Animated.View style={[{ width, height, transformOrigin: '50% 100%' }, style]}>
        {/* TEMP: stand-in for rook-front.png / the Rive rig. */}
        <Image source={LAYERS.rook.source} style={{ width, height }} resizeMode="contain" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#251A2F',
    opacity: 0.22,
  },
})
