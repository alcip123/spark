import { useRef } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SendIcon } from '../components/icons/SendIcon'
import { SparkMark } from '../components/icons/SparkMark'
import { PressableScale } from '../components/PressableScale'
import { EMPTY_THREAD, useChatStore } from '../store/chatStore'
import { useUiStore } from '../store/uiStore'
import { borders, colors, layout, radii, shadows, spacing, typography } from '../theme'

interface DiveDeeperScreenProps {
  onClose: () => void
}

export function DiveDeeperScreen({ onClose }: DiveDeeperScreenProps) {
  const insets = useSafeAreaInsets()
  const fact = useUiStore((s) => s.diveDeeperFact)
  const thread = useChatStore((s) => (fact ? s.threads[fact.id] : undefined)) ?? EMPTY_THREAD
  const send = useChatStore((s) => s.send)
  const retry = useChatStore((s) => s.retry)
  const setDraft = useChatStore((s) => s.setDraft)
  const scrollRef = useRef<ScrollView>(null)

  if (!fact) {
    return (
      <View style={[styles.emptyState, { paddingBottom: insets.bottom }]}>
        <SparkMark size={40} color={colors.borderAccent} />
        <Text style={[typography.h2, { marginTop: spacing.lg }]}>Nothing to dive into yet</Text>
        <Text style={[typography.body, styles.emptySubline]}>
          Pick a fact from your feed and come back to go deeper on it.
        </Text>
        <PressableScale
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Browse facts"
          style={[styles.emptyCta, shadows.button]}
        >
          <Text style={typography.button}>Browse facts</Text>
        </PressableScale>
      </View>
    )
  }

  const { messages, status, draft } = thread

  function handleSend() {
    if (!fact) return
    send(fact, draft)
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* iOS pageSheet modals already sit below the status bar; Android's Modal
          is full-screen, so the sheet must add the status-bar inset itself. */}
      <View
        style={[
          styles.header,
          styles.column,
          { paddingTop: Platform.OS === 'android' ? insets.top + spacing.md : spacing.lg },
        ]}
      >
        <Text style={typography.h2}>Dive Deeper</Text>
        <PressableScale
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close Dive Deeper"
          style={styles.doneButton}
        >
          <Text style={[typography.button, { color: colors.accentPrimary }]}>Done</Text>
        </PressableScale>
      </View>

      {/* The fact under discussion, pinned above the conversation */}
      <View style={styles.column}>
        <View style={[styles.factCard, shadows.card]}>
          <Text style={[typography.caption, styles.factLabel]}>DIVING INTO</Text>
          <Text style={typography.h2}>{fact.text}</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={[styles.thread, styles.column]}
        contentContainerStyle={styles.threadContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && status === 'idle' && (
          <Text style={[typography.body, styles.hint]}>
            Ask anything about this fact — why it's true, what's behind it, where it leads.
          </Text>
        )}
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}
          >
            <Text
              style={[
                typography.body,
                msg.role === 'user' && { color: colors.onAccent },
              ]}
            >
              {msg.content}
            </Text>
          </View>
        ))}
        {status === 'sending' && (
          <Text style={[typography.caption, styles.sendingIndicator]}>…</Text>
        )}
        {status === 'error' && (
          <PressableScale onPress={() => retry(fact)} hitSlop={8} style={styles.retryButton}>
            <Text style={[typography.caption, { color: colors.accentText }]}>
              Couldn't get a response — tap to retry
            </Text>
          </PressableScale>
        )}
      </ScrollView>

      <View style={[styles.inputRow, styles.column, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          style={[styles.input, typography.body]}
          value={draft}
          onChangeText={(text) => setDraft(fact.id, text)}
          placeholder="Ask a follow-up…"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={status !== 'sending'}
        />
        <PressableScale
          onPress={handleSend}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Send"
          style={[styles.sendButton, shadows.button]}
        >
          <SendIcon size={20} color={colors.onAccent} />
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
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
  emptyCta: {
    marginTop: spacing.lg,
    backgroundColor: colors.accentPrimary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
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
  factCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.bgAlt,
    borderRadius: radii.card,
    ...borders.accent,
  },
  factLabel: {
    color: colors.textMuted,
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
  hint: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bubble: {
    maxWidth: '85%',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.card,
  },
  userBubble: {
    alignSelf: 'flex-end',
    // accentSurface: this bubble carries regular-weight white text, which
    // needs the darker shade to clear 4.5:1 (accentPrimary alone is ~3.5:1).
    backgroundColor: colors.accentSurface,
    // Softer radius on the corner nearest the sender gives the bubble a
    // sense of direction instead of reading as a generic rounded rectangle.
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgAlt,
    borderBottomLeftRadius: 4,
    ...borders.default,
  },
  sendingIndicator: {
    color: colors.textMuted,
    marginLeft: spacing.md,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    paddingVertical: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgAlt,
    borderRadius: radii.pill,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    ...borders.default,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
  },
})
