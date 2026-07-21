import type { ReactElement } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Tab } from '../store/uiStore'
import { borders, colors, radii, shadows, spacing } from '../theme'
import { PressableScale } from './PressableScale'
import { DiscoverIcon } from './icons/DiscoverIcon'
import { ProfileIcon } from './icons/ProfileIcon'
import { SparkMark } from './icons/SparkMark'

// Content height of the floating pill and its gap from the screen edge
// (before the device's safe-area inset, which is added on top).
const PILL_HEIGHT = 60
const PILL_BOTTOM_MARGIN = 16

const TABS: { tab: Tab; label: string; Icon: (props: { size?: number; color: string }) => ReactElement }[] = [
  { tab: 'home', label: 'Discover', Icon: DiscoverIcon },
  { tab: 'diveDeeper', label: 'Dive Deeper', Icon: SparkMark },
  { tab: 'profile', label: 'Profile', Icon: ProfileIcon },
]

interface BottomDockProps {
  activeTab: Tab
  onSelectTab: (tab: Tab) => void
  onDiveDeeper: () => void
}

export function BottomDock({ activeTab, onSelectTab, onDiveDeeper }: BottomDockProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + PILL_BOTTOM_MARGIN }]}>
      <View style={[styles.pill, borders.default, shadows.sheet]}>
        {TABS.map(({ tab, label, Icon }) => {
          // Dive Deeper opens a sheet rather than switching tabs, so it has no
          // active state — the filled accent circle is its permanent look.
          const isDive = tab === 'diveDeeper'
          const isActive = !isDive && activeTab === tab
          return (
            <PressableScale
              key={tab}
              onPress={() => (isDive ? onDiveDeeper() : onSelectTab(tab))}
              // 44pt buttons + 4 slop = 48dp effective target on Android
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={isDive ? undefined : { selected: isActive }}
              style={isDive ? [styles.tabButton, styles.diveButton, shadows.button] : styles.tabButton}
            >
              <Icon
                size={24}
                color={isDive ? colors.onAccent : isActive ? colors.accentPrimary : colors.textMuted}
              />
            </PressableScale>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Full-width, non-interactive positioning shell — centers the intrinsic-
  // width pill without stretching it. Plain Views don't intercept touches in
  // RN, so the empty space flanking the pill stays tappable to whatever is
  // beneath it.
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT,
    maxWidth: '90%',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.bgAlt,
  },
  tabButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diveButton: {
    borderRadius: radii.pill,
    backgroundColor: colors.accentPrimary,
  },
})
