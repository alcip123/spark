import { useCallback, useEffect, useRef } from 'react'
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { lightImpact } from './haptics'
import type { RookPose } from './RookCharacter'

// The Get Started choreography (spec §28), ~1.75s. Continuous values (camera,
// fades, hop, settle) are Reanimated shared values on the UI thread; the
// discrete beats (Rook poses, the arrival haptic, advancing the phase) are JS
// timeouts that are tracked so snapToEnd()/unmount can cancel them — a late
// beat must never move a user who has already moved on.
//
//   0     tap (haptic + button compress handled by CtaButton)
//   100   Rook's attention goes to the glow          (pose: lookGlow → notice)
//   250   headline starts fading
//   300   CTA fades, drifts ~10px down
//   400   Rook turns toward the interior             (pose: turnAway)
//   500   tiny hop forward                           (pose: hopForward)
//   600   camera push begins: wall scales out, parallax separates
//   1000  ~80–90% interior; 1200 frame fully past the viewport
//   1350  camera decelerates to rest
//   1500  Rook lands; arrival haptic                 (pose: land)
//   1650  turns back toward the user                 (pose: turnBack)
//   1750  greets; speech bubble appears              (pose: greet → talkIdle)
//
// Timings are starting values, to be tuned against the production art.

const CAMERA_DELAY = 600
const CAMERA_MS = 750
const CAMERA_EASE = Easing.bezier(0.45, 0, 0.2, 1) // slow-in, long cinematic settle

interface Options {
  /** Start already inside (hot reload / re-entry past the push). */
  startInside: boolean
  reducedMotion: boolean
  setPose: (pose: RookPose) => void
  /** Called once the entrance has finished (or been snapped). */
  onArrived: () => void
}

export function useWelcomeTimeline({ startInside, reducedMotion, setPose, onArrived }: Options) {
  const inside = startInside ? 1 : 0
  const camera = useSharedValue(inside)
  const headlineOpacity = useSharedValue(1 - inside)
  const ctaOpacity = useSharedValue(1 - inside)
  const ctaDrop = useSharedValue(0)
  const rookHop = useSharedValue(0)
  const rookSettle = useSharedValue(inside)
  const wallOpacity = useSharedValue(1 - inside)
  // Reduce Motion: a dip-to-wall cross-fade replaces the push.
  const veil = useSharedValue(0)
  const nudge = useSharedValue(0)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])
  const at = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const play = useCallback(() => {
    if (reducedMotion) {
      // Portal nudges ~4%, dips into the wall colour, then the room is simply
      // there at full size. No camera movement, no parallax.
      nudge.value = withTiming(1, { duration: 160 })
      veil.value = withSequence(
        withTiming(1, { duration: 160 }, (finished) => {
          if (!finished) return
          camera.value = 1
          wallOpacity.value = 0
          rookSettle.value = 1
          headlineOpacity.value = 0
          ctaOpacity.value = 0
          nudge.value = 0
        }),
        withTiming(0, { duration: 220 })
      )
      at(380, () => {
        setPose('greet')
        onArrived()
      })
      return
    }

    headlineOpacity.value = withDelay(250, withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) }))
    ctaOpacity.value = withDelay(300, withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) }))
    ctaDrop.value = withDelay(300, withTiming(10, { duration: 300, easing: Easing.out(Easing.quad) }))
    rookHop.value = withDelay(
      500,
      withSequence(
        withTiming(-22, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 170, easing: Easing.in(Easing.cubic) })
      )
    )
    rookSettle.value = withDelay(500, withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.cubic) }))
    camera.value = withDelay(CAMERA_DELAY, withTiming(1, { duration: CAMERA_MS, easing: CAMERA_EASE }))

    at(100, () => setPose('lookGlow'))
    at(180, () => setPose('notice'))
    at(400, () => setPose('turnAway'))
    at(500, () => setPose('hopForward'))
    at(1500, () => {
      setPose('land')
      lightImpact() // the one arrival haptic
    })
    at(1650, () => setPose('turnBack'))
    at(1750, () => {
      setPose('greet')
      onArrived()
    })
    at(2750, () => setPose('talkIdle'))
  }, [at, camera, ctaDrop, ctaOpacity, headlineOpacity, onArrived, reducedMotion, rookHop, rookSettle, setPose, veil, nudge, wallOpacity])

  /** Jump straight to the end state (app resumed mid-entrance, etc). */
  const snapToEnd = useCallback(() => {
    clearTimers()
    for (const v of [camera, headlineOpacity, ctaOpacity, ctaDrop, rookHop, rookSettle, wallOpacity, veil, nudge]) {
      cancelAnimation(v)
    }
    camera.value = 1
    headlineOpacity.value = 0
    ctaOpacity.value = 0
    ctaDrop.value = 0
    rookHop.value = 0
    rookSettle.value = 1
    wallOpacity.value = 0
    veil.value = 0
    nudge.value = 0
    setPose('idle')
  }, [camera, clearTimers, ctaDrop, ctaOpacity, headlineOpacity, nudge, rookHop, rookSettle, setPose, veil, wallOpacity])

  return { camera, headlineOpacity, ctaOpacity, ctaDrop, rookHop, rookSettle, wallOpacity, veil, nudge, play, snapToEnd }
}
