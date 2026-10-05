import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AppState, Image, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { track } from '../lib/analytics'
import { OnboardingScreen } from '../screens/OnboardingScreen'
import { SignUpScreen } from '../screens/SignUpScreen'
import { displayType, onboarding, typography } from '../theme'
import { CtaButton } from './CtaButton'
import { PortalFrame } from './PortalFrame'
import { type RookPose, RookCharacter } from './RookCharacter'
import { renderPlaceholder } from './placeholders'
import { FOREGROUND_ORDER, LAYERS, ROOK_PLACEMENT, ROOM_ORDER, type LayerKey } from './sceneAssets'
import { type SceneGeometry, computeSceneGeometry, layerEndScale, roomLayerTransform } from './sceneGeometry'
import { SpeechBubble } from './SpeechBubble'
import { useWelcomeTimeline } from './useWelcomeTimeline'

// One continuous scene, viewed from two camera positions: through the portal
// (camera 0) and inside the room (camera 1). The room layers are mounted once
// and stay mounted for the whole flow — the portal is a window onto them, and
// the push only scales/translates the same layers — so the interior you look
// at before tapping IS the interior you arrive in. Later steps (greeting,
// curiosity prompt, topics, sign up) are foreground UI over this same room.
//
// Depth, back to front: background → glow → midground → Rook → portal wall +
// frame → foreground foliage → dim/wash → UI.

export type OnboardingPhase =
  | 'welcome'
  | 'entering'
  | 'rookGreeting'
  | 'curiosityPrompt'
  | 'topicSelection'
  | 'signUp'

interface OnboardingSceneProps {
  phase: OnboardingPhase
  onPhaseChange: (phase: OnboardingPhase) => void
  /** Sign Up finished — onboarding is complete. */
  onComplete: () => void
}

const ONBOARDING_VERSION = 2
const GREETING = "Hey there, I'm Rook!"
const PROMPT = 'Before we find your Spark, what are you curious about?'
// How long the question stays up before the topic picker takes over on its own
// (Continue skips the wait).
const PROMPT_HOLD_MS = 3600
const ROOK_ASIDE_SCALE = 0.42
const STATE_MS = 340

const isInside = (p: OnboardingPhase) => p !== 'welcome' && p !== 'entering'

export function OnboardingScene({ phase, onPhaseChange, onComplete }: OnboardingSceneProps) {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const reduced = useReducedMotion()
  const [pose, setPose] = useState<RookPose>('idle')
  const geometry = useMemo(
    () => computeSceneGeometry({ width, height, insetTop: insets.top, insetBottom: insets.bottom }),
    [width, height, insets.top, insets.bottom]
  )

  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const shownAt = useRef(Date.now())

  const handleArrived = useCallback(() => {
    // Guard: a late beat must not move a user who already left `entering`.
    if (phaseRef.current === 'entering') onPhaseChange('rookGreeting')
  }, [onPhaseChange])

  const tl = useWelcomeTimeline({
    startInside: isInside(phase),
    reducedMotion: reduced,
    setPose,
    onArrived: handleArrived,
  })

  // Foreground-state shared values (the minor transitions).
  const rookAside = useSharedValue(0)
  const rookAlpha = useSharedValue(1)
  const plumDim = useSharedValue(0)
  const creamWash = useSharedValue(0)

  useEffect(() => {
    track('welcome_screen_viewed', {
      animation_enabled: !reduced,
      platform: Platform.OS,
      onboarding_version: ONBOARDING_VERSION,
    })
    // once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Interruption / re-entry: if the app comes back mid-entrance, snap to the
  // end state instead of resuming a half-run animation, so the state machine
  // can never be left stuck between phases.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && phaseRef.current === 'entering') {
        tl.snapToEnd()
        onPhaseChange('rookGreeting')
      }
    })
    return () => sub.remove()
  }, [tl, onPhaseChange])

  // Phase → foreground treatment of the persistent room.
  useEffect(() => {
    const timing = { duration: STATE_MS, easing: Easing.inOut(Easing.cubic) }
    const aside = phase === 'topicSelection' || phase === 'signUp' ? 1 : 0
    // Moving Rook is movement; Reduce Motion gets a straight swap.
    rookAside.value = reduced ? aside : withTiming(aside, timing)
    rookAlpha.value = withTiming(phase === 'signUp' ? 0 : 1, timing)
    // Room dims only slightly (never a heavy blur) under the picker; Sign Up
    // quiets it further with a warm wash so dark type stays legible.
    plumDim.value = withTiming(phase === 'topicSelection' ? 0.38 : 0, timing)
    creamWash.value = withTiming(phase === 'signUp' ? 0.9 : 0, timing)
  }, [phase, reduced, rookAside, rookAlpha, plumDim, creamWash])

  // The question holds briefly, then the picker takes over.
  useEffect(() => {
    if (phase !== 'curiosityPrompt') return
    const t = setTimeout(() => onPhaseChange('topicSelection'), PROMPT_HOLD_MS)
    return () => clearTimeout(t)
  }, [phase, onPhaseChange])

  const handleGetStarted = useCallback(() => {
    if (phaseRef.current !== 'welcome') return // double-tap / tap mid-entrance
    track('welcome_get_started_pressed', {
      time_on_screen_ms: Date.now() - shownAt.current,
      onboarding_version: ONBOARDING_VERSION,
    })
    onPhaseChange('entering')
    tl.play()
  }, [onPhaseChange, tl])

  const g = geometry
  const showWall = !isInside(phase)

  const headlineStyle = useAnimatedStyle(() => ({ opacity: tl.headlineOpacity.value }))
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: tl.ctaOpacity.value,
    transform: [{ translateY: tl.ctaDrop.value }],
  }))
  const dimStyle = useAnimatedStyle(() => ({ opacity: plumDim.value }))
  const washStyle = useAnimatedStyle(() => ({ opacity: creamWash.value }))
  const veilStyle = useAnimatedStyle(() => ({ opacity: tl.veil.value }))
  const rootStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.04 * tl.nudge.value }] }))

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      {/* Room: mounted once, never swapped. Decorative, hidden from the a11y tree. */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {ROOM_ORDER.map((key) =>
          key === 'rook' ? (
            <RookLayer
              key={key}
              g={g}
              camera={tl.camera}
              hop={tl.rookHop}
              settle={tl.rookSettle}
              aside={rookAside}
              alpha={rookAlpha}
              pose={pose}
              reduced={reduced}
            />
          ) : (
            <RoomLayer key={key} layer={key} g={g} camera={tl.camera} />
          )
        )}
        {showWall && <PortalFrame camera={tl.camera} wallOpacity={tl.wallOpacity} geometry={g} />}
        {FOREGROUND_ORDER.map((key) => (
          <RoomLayer key={key} layer={key} g={g} camera={tl.camera} />
        ))}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: onboarding.room }, dimStyle]} />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: onboarding.paper }, washStyle]} />
        {/* Reduce Motion dip-to-wall cross-fade. */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: onboarding.paper }, veilStyle]} />
      </View>

      {/* Foreground UI */}
      {!isInside(phase) && (
        <>
          <Animated.View
            style={[styles.headline, { top: g.headlineTop }, headlineStyle]}
            pointerEvents="none"
          >
            <Text style={styles.headlineSans} accessibilityRole="header" accessibilityLabel="Find your Spark.">
              Find your
            </Text>
            <Text style={styles.headlineDisplay} accessible={false}>
              Spark.
            </Text>
          </Animated.View>
          <Animated.View style={[styles.cta, { top: g.ctaTop }, ctaStyle]}>
            <CtaButton label="Get started" arrow width={g.ctaWidth} height={g.ctaHeight} onPress={handleGetStarted} />
          </Animated.View>
        </>
      )}

      {(phase === 'rookGreeting' || phase === 'curiosityPrompt') && (
        <>
          <View style={[styles.bubble, { top: g.bubbleTop }]} pointerEvents="none">
            <SpeechBubble
              key={phase}
              text={phase === 'rookGreeting' ? GREETING : PROMPT}
              maxWidth={Math.min(width * 0.8, 420)}
            />
          </View>
          <View style={[styles.continue, { bottom: insets.bottom + g.bottomPad }]}>
            <CtaButton
              label="Continue"
              arrow
              width={g.ctaWidth}
              height={g.ctaHeight}
              onPress={() => onPhaseChange(phase === 'rookGreeting' ? 'curiosityPrompt' : 'topicSelection')}
            />
          </View>
        </>
      )}

      {phase === 'topicSelection' && (
        <Rise reduced={reduced}>
          <OnboardingScreen
            topInset={insets.top + (height - insets.top - insets.bottom) * ROOK_ASIDE_ZONE}
            onContinue={() => onPhaseChange('signUp')}
          />
        </Rise>
      )}
      {phase === 'signUp' && (
        <Rise reduced={reduced}>
          <SignUpScreen overScene onContinue={onComplete} />
        </Rise>
      )}
    </Animated.View>
  )
}

// Fraction of the usable height reserved above the picker for Rook-aside + heading.
const ROOK_ASIDE_ZONE = 0.3

// ── Room layers ────────────────────────────────────────────────────────────

function useLayerStyle(camera: SharedValue<number>, g: SceneGeometry, depth: number) {
  return useAnimatedStyle(() => {
    const t = roomLayerTransform(camera.value, g, depth)
    return { transform: [{ translateX: t.translateX }, { translateY: t.translateY }, { scale: t.scale }] }
  })
}

function RoomLayer({ layer, g, camera }: { layer: LayerKey; g: SceneGeometry; camera: SharedValue<number> }) {
  const spec = LAYERS[layer]
  const style = useLayerStyle(camera, g, spec.depth)
  const w = spec.w * g.width
  const h = spec.h * g.height
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <View style={{ position: 'absolute', left: spec.x * g.width, top: spec.y * g.height, width: w, height: h }}>
        {spec.source ? (
          <Image source={spec.source} style={{ width: w, height: h }} resizeMode="stretch" />
        ) : (
          renderPlaceholder(layer, w, h)
        )}
      </View>
    </Animated.View>
  )
}

interface RookLayerProps {
  g: SceneGeometry
  camera: SharedValue<number>
  hop: SharedValue<number>
  settle: SharedValue<number>
  aside: SharedValue<number>
  alpha: SharedValue<number>
  pose: RookPose
  reduced: boolean
}

function RookLayer({ g, camera, hop, settle, aside, alpha, pose, reduced }: RookLayerProps) {
  const depth = LAYERS.rook.depth
  const layerStyle = useLayerStyle(camera, g, depth)
  const rookW = LAYERS.rook.w * g.width
  const rookH = rookW * ROOK_PLACEMENT.aspect
  const { feetX, feetY, settledFeetX, settledFeetY } = ROOK_PLACEMENT

  // Settled-in-the-room offset (he hops a little deeper in).
  const settleDx = (settledFeetX - feetX) * g.width
  const settleDy = (settledFeetY - feetY) * g.height

  // Aside target: feet near the top of the screen once the picker is up. The
  // layer is scaled about the screen centre at camera 1, so solve for the
  // room-space position that lands on the screen-space target.
  const endScale = layerEndScale(depth)
  const cx = g.width / 2
  const cy = g.height / 2
  const targetScreenY = g.bubbleTop + g.height * ROOK_ASIDE_ZONE * 0.55
  const targetRoomX = cx // centred on screen, so the scale about the centre leaves x unchanged
  const targetRoomY = cy + (targetScreenY - cy) / endScale
  const asideDx = targetRoomX - settledFeetX * g.width
  const asideDy = targetRoomY - settledFeetY * g.height

  const rookStyle = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [
      { translateX: settle.value * settleDx + aside.value * asideDx },
      { translateY: settle.value * settleDy + aside.value * asideDy + hop.value },
      { scale: (1 + 0.06 * settle.value) * (1 + aside.value * (ROOK_ASIDE_SCALE - 1)) },
    ],
  }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, layerStyle]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: feetX * g.width - rookW / 2,
            top: feetY * g.height - rookH,
            width: rookW,
            height: rookH,
            transformOrigin: '50% 100%',
          },
          rookStyle,
        ]}
      >
        <RookCharacter width={rookW} pose={pose} reducedMotion={reduced} />
      </Animated.View>
    </Animated.View>
  )
}

// ── Foreground state wrapper ───────────────────────────────────────────────

// Foreground UI "rises" in over the room: opacity + a small upward drift. Not
// a slide — the room stays put. Reduce Motion: opacity only.
function Rise({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const p = useSharedValue(0)
  useEffect(() => {
    p.value = withTiming(1, { duration: STATE_MS, easing: Easing.out(Easing.cubic) })
  }, [p])
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: reduced ? 0 : (1 - p.value) * 14 }],
  }))
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Behind the room layers: if the arch hole ever outgrows a layer's bleed
    // you see room-dark, never the cream wall colour.
    backgroundColor: onboarding.room,
    // Layers (the background especially) are deliberately oversized for bleed.
    // On web `hidden` still lets a focused button scroll the container (shifting
    // the whole scene), so use `clip`, which can't be scrolled.
    overflow: Platform.OS === 'web' ? ('clip' as 'hidden') : 'hidden',
  },
  headline: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headlineSans: {
    ...typography.bodyLg,
    fontSize: 24,
    lineHeight: 28,
    color: onboarding.headline,
  },
  headlineDisplay: {
    ...displayType,
    fontSize: 38,
    lineHeight: 42,
    marginTop: -2,
    color: onboarding.headline,
  },
  cta: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  continue: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
})
