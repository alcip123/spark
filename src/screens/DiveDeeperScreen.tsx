import { BlurView } from 'expo-blur'
import { useEffect, useRef, useState } from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInUp,
  FadeOut,
  LinearTransition,
  SlideInUp,
  interpolate,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SendIcon } from '../components/icons/SendIcon'
import { PressableScale } from '../components/PressableScale'
import { PrimaryButton } from '../components/PrimaryButton'
import { DiveDeeperBackdrop } from './diveDeeper/DiveDeeperBackdrop'
import { diveDeeperColors, diveDeeperTypography } from './diveDeeper/diveDeeperTheme'
import { SparkFocalMark } from './diveDeeper/SparkFocalMark'
import { ThinkingSparkMark } from './diveDeeper/ThinkingSparkMark'
import { TypewriterText } from './diveDeeper/TypewriterText'
import { TypingWaveform } from './diveDeeper/TypingWaveform'
import { EMPTY_SUGGESTIONS, EMPTY_THREAD, useChatStore } from '../store/chatStore'
import { useUiStore } from '../store/uiStore'
import { colors, layout, radii, spacing, typography } from '../theme'

// Stagger between suggestion chips fading in, so a batch that arrived at
// once still reads as "being generated" one after another.
const SUGGESTION_STAGGER_MS = 150

const ENTRANCE_EASING = Easing.bezier(0.16, 1, 0.3, 1)
const CARD_EASING = Easing.bezier(0.22, 1, 0.36, 1)

// Frosted glass panel used for the fact card, message bubbles, and input
// bar on this screen — see diveDeeperTheme.ts for why Dive Deeper carries
// its own glass treatment instead of theme.ts's shared `glass` tokens.
function GlassPanel({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}) {
  return (
    <View style={[styles.glassPanel, style]}>
      <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} blurMethod="dimezisBlurView" />
      <View style={styles.glassSpecular} />
      <View style={styles.glassContent}>{children}</View>
    </View>
  )
}

interface DiveDeeperScreenProps {
  onClose: () => void
}

export function DiveDeeperScreen({ onClose }: DiveDeeperScreenProps) {
  const insets = useSafeAreaInsets()
  const fact = useUiStore((s) => s.diveDeeperFact)
  const thread = useChatStore((s) => (fact ? s.threads[fact.id] : undefined)) ?? EMPTY_THREAD
  const suggestions =
    useChatStore((s) => (fact ? s.suggestions[fact.id] : undefined)) ?? EMPTY_SUGGESTIONS
  const send = useChatStore((s) => s.send)
  const retry = useChatStore((s) => s.retry)
  const setDraft = useChatStore((s) => s.setDraft)
  const fetchSuggestions = useChatStore((s) => s.fetchSuggestions)
  const dismissSuggestions = useChatStore((s) => s.dismissSuggestions)
  const scrollRef = useRef<ScrollView>(null)

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [typingTick, setTypingTick] = useState(0)
  // Index of the one message that should type itself out — set only when a
  // fresh assistant reply lands, never on mount/replay of older history.
  const [typewriterIndex, setTypewriterIndex] = useState(-1)

  const backdropOpacity = useSharedValue(0)
  const cardEntrance = useSharedValue(0)
  const keyboard = useAnimatedKeyboard()
  // Captured once from the focal wrap's real (keyboard-closed) layout height,
  // so the collapse below can animate from "actual measured height" to 0
  // instead of guessing a fixed number that'd drift if the mark's size ever
  // changes.
  const focalWrapHeight = useSharedValue(0)

  useEffect(() => {
    backdropOpacity.value = withTiming(1, { duration: 500, easing: ENTRANCE_EASING })
    cardEntrance.value = withTiming(1, { duration: 300, easing: CARD_EASING })
  }, [backdropOpacity, cardEntrance])

  useEffect(() => {
    const last = thread.messages[thread.messages.length - 1]
    if (last?.role === 'assistant') {
      setTypewriterIndex(thread.messages.length - 1)
    }
    // Only re-check when a message is added/removed, not on every thread
    // object identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.messages.length])

  // Suggested follow-ups: fetched once when a fact with no conversation yet
  // is opened, then re-fetched every time a fresh assistant reply lands so
  // they stay grounded in where the conversation actually went.
  useEffect(() => {
    if (!fact) return
    const last = thread.messages[thread.messages.length - 1]
    if (thread.messages.length === 0 || last?.role === 'assistant') {
      fetchSuggestions(fact, thread.messages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fact?.id, thread.messages.length])

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }))
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardEntrance.value,
    transform: [{ translateY: (1 - cardEntrance.value) * 16 }],
  }))
  // Grows/shrinks in lockstep with the OS keyboard animation (frame-synced
  // shared value from useAnimatedKeyboard, not a Keyboard-event listener)
  // so the input row rises smoothly above the keyboard instead of being
  // hidden behind it.
  const keyboardSpacerStyle = useAnimatedStyle(() => ({ height: keyboard.height.value }))
  // Same shared value drives the focal mark shrinking away as the keyboard
  // rises. Collapsing its actual layout height (not just scaling/fading the
  // content) is what makes the fact card ride up to fill the space — a pure
  // transform leaves the reserved box in place and the card never moves.
  const focalKeyboardStyle = useAnimatedStyle(() => {
    const kbHeight = keyboard.height.value
    const progress = interpolate(kbHeight, [0, 280], [0, 1], Extrapolation.CLAMP)
    const scale = interpolate(progress, [0, 1], [1, 0.4])
    const opacity = interpolate(kbHeight, [0, 200], [1, 0], Extrapolation.CLAMP)
    return {
      height: focalWrapHeight.value ? focalWrapHeight.value * (1 - progress) : undefined,
      marginBottom: spacing.sm * (1 - progress),
      opacity,
      transform: [{ scale }],
    }
  })

  function handleFocalLayout(e: LayoutChangeEvent) {
    // Capture only the first (natural, keyboard-closed) measurement — later
    // layout events fire while the animated height above is already
    // shrinking and would otherwise clobber the baseline mid-animation.
    if (focalWrapHeight.value === 0) {
      focalWrapHeight.value = e.nativeEvent.layout.height
    }
  }

  function handleCanvasLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout
    setCanvasSize({ width, height })
  }

  if (!fact) {
    return (
      <View style={[styles.emptyState, { paddingBottom: insets.bottom }]}>
        <SparkFocalMark size={40} />
        <Text style={[typography.h2, { marginTop: spacing.lg, color: colors.textPrimary }]}>
          Nothing to dive into yet
        </Text>
        <Text style={[typography.body, styles.emptySubline]}>
          Pick a fact from your feed and come back to go deeper on it.
        </Text>
        <View style={styles.emptyCtaWrap}>
          <PrimaryButton label="Browse facts" onPress={onClose} />
        </View>
      </View>
    )
  }

  const { messages, status, draft } = thread
  const hasStartedChat = messages.length > 0

  function handleSend() {
    if (!fact) return
    send(fact, draft)
  }

  function handleChangeText(text: string) {
    if (!fact) return
    setDraft(fact.id, text)
    setTypingTick((t) => t + 1)
  }

  return (
    <View style={styles.page} onLayout={handleCanvasLayout}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <DiveDeeperBackdrop width={canvasSize.width} height={canvasSize.height} />
      </Animated.View>

      <View style={styles.flex}>
        {/* iOS pageSheet modals already sit below the status bar; Android's Modal
            is full-screen, so the sheet must add the status-bar inset itself. */}
        <View
          style={[
            styles.header,
            styles.column,
            { paddingTop: Platform.OS === 'android' ? insets.top + spacing.md : spacing.lg },
          ]}
        >
          <Text style={[diveDeeperTypography.h2]}>Dive Deeper</Text>
          <PressableScale
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close Dive Deeper"
            style={styles.doneButton}
          >
            <Text style={[typography.button, { color: diveDeeperColors.textPrimary }]}>Done</Text>
          </PressableScale>
        </View>

        {/* Hidden once a message has been sent (hasStartedChat) AND the
            instant a send is in flight (status === 'sending') — messages
            isn't updated with the exchange until the reply resolves, so
            gating on hasStartedChat alone left the mark visible through the
            whole "thinking" wait on a first send. */}
        {!hasStartedChat && status !== 'sending' && (
          // Split in two: the outer view owns the exit (unmount) animation,
          // the inner one owns the continuous per-frame keyboard style.
          // Reanimated warns if the same node carries both — a layout
          // animation and a useAnimatedStyle opacity fight over the prop.
          <Animated.View exiting={FadeOut.duration(250)}>
            <Animated.View onLayout={handleFocalLayout} style={[styles.focalWrap, focalKeyboardStyle]}>
              <SparkFocalMark size={72} />
            </Animated.View>
          </Animated.View>
        )}

        {/* The fact under discussion — stays full-size for the whole
            conversation so the user can always refer back to it. The layout
            transition below is what lets it (and everything under it) rise
            smoothly into the space the focal mark leaves once it unmounts
            on send. */}
        <Animated.View
          style={[styles.column, cardStyle]}
          layout={LinearTransition.duration(400).easing(CARD_EASING)}
        >
          <GlassPanel style={styles.factCard}>
            <Text style={[diveDeeperTypography.caption, styles.factLabel]}>DIVING INTO</Text>
            <Text style={diveDeeperTypography.h2}>{fact.text}</Text>
          </GlassPanel>

          {suggestions.items.length > 0 && status !== 'sending' && (
            <View style={styles.suggestionRow}>
              {suggestions.items.map((question, i) => (
                <Animated.View key={question} entering={FadeIn.duration(320).delay(i * SUGGESTION_STAGGER_MS)}>
                  <PressableScale
                    onPress={() => {
                      // Dismiss first: send() triggers the reply, and the
                      // effect that re-fetches suggestions runs when it lands.
                      dismissSuggestions(fact.id)
                      send(fact, question)
                    }}
                    hitSlop={4}
                  >
                    <GlassPanel style={styles.suggestionChip}>
                      <Text style={diveDeeperTypography.caption}>{question}</Text>
                    </GlassPanel>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        <ScrollView
          ref={scrollRef}
          style={[styles.thread, styles.column]}
          contentContainerStyle={styles.threadContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <Animated.View
              key={i}
              entering={msg.role === 'user' ? SlideInUp.duration(280).easing(CARD_EASING) : FadeInUp.duration(320)}
              style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}
            >
              <GlassPanel>
                {i === typewriterIndex ? (
                  <TypewriterText text={msg.content} style={diveDeeperTypography.body} />
                ) : (
                  <Text style={diveDeeperTypography.body}>{msg.content}</Text>
                )}
              </GlassPanel>
            </Animated.View>
          ))}
          {status === 'sending' && <ThinkingSparkMark />}
          {status === 'error' && (
            <PressableScale onPress={() => retry(fact)} hitSlop={8} style={styles.retryButton}>
              <Text style={[diveDeeperTypography.caption, { color: diveDeeperColors.accent }]}>
                Couldn't get a response — tap to retry
              </Text>
            </PressableScale>
          )}
        </ScrollView>

        <Animated.View style={[styles.column, cardStyle]}>
          <GlassPanel style={styles.inputRow}>
            <View style={{ paddingBottom: insets.bottom > 0 ? insets.bottom - spacing.sm : 0 }}>
              <View style={styles.inputInner}>
                <TextInput
                  style={[styles.input, diveDeeperTypography.body]}
                  value={draft}
                  onChangeText={handleChangeText}
                  placeholder="Ask a follow-up…"
                  placeholderTextColor={diveDeeperColors.textSecondary}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  editable={status !== 'sending'}
                />
                <PressableScale
                  onPress={handleSend}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Send"
                  style={styles.sendButton}
                >
                  <SendIcon size={20} color={diveDeeperColors.textPrimary} />
                </PressableScale>
              </View>
              <TypingWaveform typingTick={typingTick} />
            </View>
          </GlassPanel>
        </Animated.View>

        <Animated.View style={keyboardSpacerStyle} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: diveDeeperColors.surface,
  },
  flex: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg,
  },
  emptySubline: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyCtaWrap: {
    marginTop: spacing.lg,
  },
  // Shared reading-measure cap so the chat column doesn't stretch edge to
  // edge on tablets/large windows.
  column: {
    width: '100%',
    maxWidth: layout.maxReadingWidth,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  doneButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  focalWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  glassPanel: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  glassSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: diveDeeperColors.glassSpecularTop,
  },
  glassContent: {
    backgroundColor: diveDeeperColors.glassFill,
    padding: spacing.md,
  },
  factCard: {
    marginHorizontal: spacing.lg,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  suggestionChip: {
    borderRadius: radii.pill,
  },
  factLabel: {
    color: diveDeeperColors.textSecondary,
    marginBottom: spacing.xs,
  },
  thread: {
    flex: 1,
  },
  threadContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  inputRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: diveDeeperColors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: diveDeeperColors.accent,
  },
})
