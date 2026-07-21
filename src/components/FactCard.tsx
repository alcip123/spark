import { memo, useState } from 'react'
import { Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DOCK_HEIGHT } from '../constants/layout'
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'
import { useFeedStore } from '../store/feedStore'
import { colors, layout, shadows, spacing, typography } from '../theme'
import type { Fact, TextSize } from '../types'
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

// ︎ forces text presentation so the filled heart renders as a tinted
// glyph, never as the red emoji.
const HEART_OUTLINE = '♡'
const HEART_FILLED = '♥︎'
const SHARE_ARROW = '↑'

interface FactCardProps {
  fact: Fact
  textSize: TextSize
}

// Memoized: a like or store update must not re-render every mounted feed card,
// only the one whose subscribed state changed.
export const FactCard = memo(function FactCard({ fact, textSize }: FactCardProps) {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const liked = useFeedStore((s) => s.likedFactIds.includes(fact.id))
  const toggleLike = useFeedStore((s) => s.toggleLike)
  const recordEngagement = useFeedStore((s) => s.recordEngagement)

  // Incremented on each like to fire the SparkBurst; unliking never bursts
  const [burstTrigger, setBurstTrigger] = useState(0)
  const heartScale = useSharedValue(1)
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }))

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
      <View style={styles.textWrap}>
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
      </View>

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
            <Animated.Text
              style={[styles.actionGlyph, liked && { color: colors.accentPrimary }, heartStyle]}
            >
              {liked ? HEART_FILLED : HEART_OUTLINE}
            </Animated.Text>
          </PressableScale>
        </View>
        <PressableScale
          onPress={handleShare}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Share this fact"
          style={[styles.actionButton, shadows.card]}
        >
          <Text style={styles.actionGlyph}>{SHARE_ARROW}</Text>
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
  actionGlyph: {
    fontSize: 22,
    color: colors.textPrimary,
  },
})
