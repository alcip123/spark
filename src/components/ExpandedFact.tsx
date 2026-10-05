import * as Haptics from 'expo-haptics'
import { useEffect, useState } from 'react'
import { Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { track } from '../lib/analytics'
import { useFeedStore } from '../store/feedStore'
import { colors, layout, radii, shadows, spacing, typography } from '../theme'
import type { Fact } from '../types'
import { ArrowLeftIcon } from './icons/ArrowLeftIcon'
import { HeartIcon } from './icons/HeartIcon'
import { ShareIcon } from './icons/ShareIcon'
import { SparkMark } from './icons/SparkMark'
import { PressableScale } from './PressableScale'
import { SparkBurst } from './SparkBurst'

// Slide-and-fade in from the right, matching ScreenTransition's timing so
// forward navigation feels the same everywhere in the app. Transform and
// opacity only — animating layout would reflow the text every frame.
const DURATION_MS = 300
const SLIDE_PX = 40

const POINTS_LIKE = 3
const POINTS_SHARE = 2

interface ExpandedFactProps {
  fact: Fact
  onClose: () => void
  onDiveDeeper: (fact: Fact) => void
}

export function ExpandedFact({ fact, onClose, onDiveDeeper }: ExpandedFactProps) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const reducedMotion = useReducedMotion()

  const liked = useFeedStore((s) => s.likedFactIds.includes(fact.id))
  const toggleLike = useFeedStore((s) => s.toggleLike)
  const recordEngagement = useFeedStore((s) => s.recordEngagement)

  // Counter rather than the liked flag: a flag would fire the burst the moment
  // this screen opens on an already-liked fact.
  const [burstTrigger, setBurstTrigger] = useState(0)
  const heartScale = useSharedValue(1)
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }))

  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = withTiming(1, {
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    })
  }, [progress])

  const screenStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: reducedMotion ? 0 : (1 - progress.value) * SLIDE_PX }],
  }))

  function handleLike() {
    recordEngagement(fact, liked ? -POINTS_LIKE : POINTS_LIKE)
    track(liked ? 'fact_unliked' : 'fact_liked', { fact_id: fact.id, category: fact.categorySlug })
    if (!liked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
      setBurstTrigger((n) => n + 1)
      heartScale.value = withSequence(
        withSpring(1.25, { damping: 14, stiffness: 500, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 12, stiffness: 300, reduceMotion: ReduceMotion.System })
      )
    }
    toggleLike(fact.id)
  }

  function handleShare() {
    recordEngagement(fact, POINTS_SHARE)
    track('fact_shared', { fact_id: fact.id, category: fact.categorySlug })
    Share.share({ message: fact.text })
  }

  // The fact is the whole point of this screen, so it scales with the width it
  // has rather than sitting at one fixed size on every device.
  const factSize = Math.min(34, Math.max(24, width * 0.075))

  return (
    <Animated.View style={[styles.screen, { paddingTop: insets.top }, screenStyle]}>
      <View style={styles.header}>
        <PressableScale
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to feed"
          style={styles.backButton}
        >
          <ArrowLeftIcon size={24} color={colors.textPrimary} />
        </PressableScale>
      </View>

      <View style={styles.body}>
        <Text
          maxFontSizeMultiplier={1.4}
          style={[typography.h1, { fontSize: factSize, lineHeight: factSize * 1.3 }]}
        >
          {fact.text}
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.actionRow}>
          <View style={styles.burstAnchor}>
            <SparkBurst trigger={burstTrigger} />
            <PressableScale
              onPress={handleLike}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Like this fact"
              accessibilityState={{ selected: liked }}
              style={styles.actionButton}
            >
              <Animated.View style={heartStyle}>
                <HeartIcon size={24} color={liked ? colors.accentPrimary : colors.textMuted} filled={liked} />
              </Animated.View>
            </PressableScale>
          </View>
          <PressableScale
            onPress={handleShare}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Share this fact"
            style={styles.actionButton}
          >
            <ShareIcon size={24} color={colors.textMuted} />
          </PressableScale>
        </View>

        <PressableScale
          onPress={() => onDiveDeeper(fact)}
          accessibilityRole="button"
          accessibilityLabel="Dive Deeper"
          style={[styles.dive, shadows.button]}
        >
          <SparkMark size={24} color={colors.onAccent} />
          <Text style={typography.button}>Dive Deeper</Text>
        </PressableScale>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  // Opaque and absolutely filling: this is a screen over the feed, not a card
  // floating on top of it, so nothing shows through behind it.
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: layout.maxReadingWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    width: '100%',
    maxWidth: layout.maxReadingWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  burstAnchor: {
    overflow: 'visible',
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.accentPrimary,
  },
})
