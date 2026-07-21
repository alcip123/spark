import { memo, useState } from 'react'
import { Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DOCK_HEIGHT } from '../constants/layout'
import Animated, {
  Extrapolation,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated'
import { useFeedStore } from '../store/feedStore'
import { colors, layout, shadows, spacing, typography } from '../theme'
import type { Fact, TextSize } from '../types'
import { HeartIcon } from './icons/HeartIcon'
import { ShareIcon } from './icons/ShareIcon'
import { PressableScale } from './PressableScale'
import { SparkBurst } from './SparkBurst'

const TEXT_SIZE_PT: Record<TextSize, number> = {
  small: 20,
  medium: 26,
  large: 32,
}

// Engagement points feeding the personalization weights in useFeed
const POINTS_LIKE = 3
const POINTS_SHARE = 2

// How far (in card-heights) a card travels from center before it's fully
// settled to its resting, receded state.
const SETTLE_SCALE_FLOOR = 0.92
const SETTLE_OPACITY_FLOOR = 0.35

interface FactCardProps {
  fact: Fact
  textSize: TextSize
  index: number
  scrollY: SharedValue<number>
}

// Memoized: a like or store update must not re-render every mounted feed card,
// only the one whose subscribed state changed.
export const FactCard = memo(function FactCard({ fact, textSize, index, scrollY }: FactCardProps) {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const liked = useFeedStore((s) => s.likedFactIds.includes(fact.id))
  const toggleLike = useFeedStore((s) => s.toggleLike)
  const recordEngagement = useFeedStore((s) => s.recordEngagement)
  const reducedMotion = useReducedMotion()

  // Incremented on each like to fire the SparkBurst; unliking never bursts
  const [burstTrigger, setBurstTrigger] = useState(0)
  const heartScale = useSharedValue(1)
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }))

  // The fact settles to full size and full opacity as it centers, and gently
  // recedes as it scrolls away — depth tied directly to scroll position
  // rather than a timed animation, so it always tracks the finger exactly.
  // Skipped under Reduce Motion: this is the kind of scroll-parallax effect
  // that setting is specifically meant to suppress.
  const settleStyle = useAnimatedStyle(() => {
    if (reducedMotion) return { opacity: 1, transform: [{ scale: 1 }] }
    const distance = Math.abs(scrollY.value - index * height)
    const scale = interpolate(distance, [0, height], [1, SETTLE_SCALE_FLOOR], Extrapolation.CLAMP)
    const opacity = interpolate(distance, [0, height], [1, SETTLE_OPACITY_FLOOR], Extrapolation.CLAMP)
    return { opacity, transform: [{ scale }] }
  })

  function handleLike() {
    // Liking earns points; unliking takes them back so toggling can't farm weight
    recordEngagement(fact.categorySlug, liked ? -POINTS_LIKE : POINTS_LIKE)
    if (!liked) {
      setBurstTrigger((n) => n + 1)
      heartScale.value = withSequence(
        withSpring(1.25, { damping: 14, stiffness: 500, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 12, stiffness: 300, reduceMotion: ReduceMotion.System })
      )
    }
    toggleLike(fact.id)
  }

  function handleShare() {
    recordEngagement(fact.categorySlug, POINTS_SHARE)
    Share.share({ message: fact.text })
  }

  return (
    <View style={[styles.card, { height }]}>
      {/* The only in-flow child, so the fact centers within the full card height */}
      <Animated.View style={[styles.textWrap, settleStyle]}>
        <Text
          // Capped so extreme system font scales can't blow a fact off screen;
          // the in-app text-size setting is the intended lever beyond this.
          maxFontSizeMultiplier={1.5}
          style={[
            typography.h1,
            {
              fontSize: TEXT_SIZE_PT[textSize],
              lineHeight: TEXT_SIZE_PT[textSize] * 1.35,
              textAlign: 'center',
            },
          ]}
        >
          {fact.text}
        </Text>
      </Animated.View>

      {/* Absolutely positioned so it doesn't affect the centering above;
          lifted clear of the bottom dock overlaying the card */}
      <View style={[styles.actionRow, { bottom: DOCK_HEIGHT + insets.bottom + spacing.lg }]}>
        <View style={styles.burstAnchor}>
          <SparkBurst trigger={burstTrigger} />
          <PressableScale
            onPress={handleLike}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Like this fact"
            accessibilityState={{ selected: liked }}
            style={[styles.actionButton, shadows.card]}
          >
            <Animated.View style={heartStyle}>
              <HeartIcon size={22} color={liked ? colors.accentPrimary : colors.textPrimary} filled={liked} />
            </Animated.View>
          </PressableScale>
        </View>
        <PressableScale
          onPress={handleShare}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Share this fact"
          style={[styles.actionButton, shadows.card]}
        >
          <ShareIcon size={22} color={colors.textPrimary} />
        </PressableScale>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.bg,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.maxReadingWidth,
    paddingHorizontal: spacing.xl,
  },
  actionRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  // Positioning context for the SparkBurst so it radiates from the heart's center
  burstAnchor: {
    overflow: 'visible',
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgAlt,
  },
})
