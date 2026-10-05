import * as Haptics from 'expo-haptics'
import { memo, useState } from 'react'
import { Pressable, Share, StyleSheet, Text, View } from 'react-native'
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'
import { track } from '../lib/analytics'
import { useFeedStore } from '../store/feedStore'
import { colors, spacing, typography } from '../theme'
import type { Fact, TextSize } from '../types'
import { HeartIcon } from './icons/HeartIcon'
import { ShareIcon } from './icons/ShareIcon'
import { PRESS_IN, PressableScale, RELEASE } from './PressableScale'
import { SparkBurst } from './SparkBurst'

// Card-sized, not screen-sized: a fact no longer has to fill a whole page, so
// these sit near ordinary reading sizes and let 2-3 cards share the viewport.
const TEXT_SIZE_PT: Record<TextSize, number> = {
  small: 17,
  medium: 19,
  large: 22,
}

// Engagement points feeding the personalization weights in useFeed
const POINTS_LIKE = 3
const POINTS_SHARE = 2

// Gentler than PressableScale's own 0.93: that value is tuned for small
// controls, and a whole card shrinking that far reads as the list collapsing.
const CARD_PRESSED_SCALE = 0.98

interface FactCardProps {
  fact: Fact
  textSize: TextSize
  onPress?: (fact: Fact) => void
}

// Memoized: a like or store update must not re-render every mounted feed card,
// only the one whose subscribed state changed.
export const FactCard = memo(function FactCard({ fact, textSize, onPress }: FactCardProps) {
  const liked = useFeedStore((s) => s.likedFactIds.includes(fact.id))
  const toggleLike = useFeedStore((s) => s.toggleLike)
  const recordEngagement = useFeedStore((s) => s.recordEngagement)

  // Incremented on each like to fire the SparkBurst; unliking never bursts
  const [burstTrigger, setBurstTrigger] = useState(0)
  const heartScale = useSharedValue(1)
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }))

  // Driven by the pressable layer behind the card so the whole card responds
  // to a press, not just the invisible layer catching it.
  const cardScale = useSharedValue(1)
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }))

  function handleLike() {
    // Liking earns points; unliking takes them back so toggling can't farm weight
    recordEngagement(fact, liked ? -POINTS_LIKE : POINTS_LIKE)
    track(liked ? 'fact_unliked' : 'fact_liked', {
      fact_id: fact.id,
      category: fact.categorySlug,
    })
    if (!liked) {
      // Fired with the burst so the tap looks and feels like one event. Liking
      // only — taking a like back shouldn't feel like a reward. No-ops on web.
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

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      {/* The whole card opens the fact, but the card can't simply BE a button:
          the like/share buttons would then sit inside it — invalid HTML on web,
          and one confused control to a screen reader. Instead a full-bleed
          pressable layer sits behind everything as the first child. Later
          siblings paint on top, so the action buttons keep their own taps while
          this layer catches every other pixel of the card. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress ? () => onPress(fact) : undefined}
        onPressIn={() => {
          cardScale.value = withSpring(CARD_PRESSED_SCALE, PRESS_IN)
        }}
        onPressOut={() => {
          cardScale.value = withSpring(1, RELEASE)
        }}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open fact: ${fact.text}`}
      />

      {/* pointerEvents none: the text sits above the pressable layer, so
          without this a tap on the words would land on the Text (which has no
          handler) instead of falling through to the layer that opens the fact.
          No category label and no mark: the slug is an internal grouping. */}
      <View pointerEvents="none">
        <Text
          // Capped so extreme system font scales can't blow a card out of the
          // feed; the in-app text-size setting is the intended lever beyond this.
          maxFontSizeMultiplier={1.5}
          style={[
            typography.bodyLg,
            {
              fontSize: TEXT_SIZE_PT[textSize],
              lineHeight: TEXT_SIZE_PT[textSize] * 1.45,
            },
          ]}
        >
          {fact.text}
        </Text>
      </View>

      {/* box-none: the row itself passes touches through (so the gaps between
          buttons still open the fact); only the buttons inside claim them. */}
      <View style={styles.actionRow} pointerEvents="box-none">
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
              <HeartIcon size={20} color={liked ? colors.accentPrimary : colors.textMuted} filled={liked} />
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
          <ShareIcon size={20} color={colors.textMuted} />
        </PressableScale>
      </View>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  // A row, not a card: no surface, radius, border, shadow or side margin. The
  // fact sits directly on the page background and the list draws a hairline
  // between rows, so the feed reads as one continuous column.
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  // Spread wide: heart at the left edge of the text column, share at the right.
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Positioning context for the SparkBurst so it radiates from the heart's center
  burstAnchor: {
    overflow: 'visible',
  },
  // 32pt visual box + 12 hitSlop clears the 44pt touch-target floor
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
