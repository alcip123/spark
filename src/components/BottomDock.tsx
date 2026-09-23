import type { ReactElement } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DOCK_HEIGHT } from '../constants/layout'
import type { Tab } from '../store/uiStore'
import { colors, spacing, typography } from '../theme'
import { PressableScale } from './PressableScale'
import { DiscoverIcon } from './icons/DiscoverIcon'
import { ProfileIcon } from './icons/ProfileIcon'

// Dive Deeper used to sit here as a filled centre button. It now lives inside
// an opened fact, where it can be unambiguously about that one fact — with
// several cards visible at once, "the fact you're looking at" stopped having a
// single answer.
const TABS: { tab: Tab; label: string; Icon: (props: { size?: number; color: string }) => ReactElement }[] = [
  { tab: 'home', label: 'Discover', Icon: DiscoverIcon },
  { tab: 'profile', label: 'Profile', Icon: ProfileIcon },
]

interface BottomDockProps {
  activeTab: Tab
  onSelectTab: (tab: Tab) => void
}

export function BottomDock({ activeTab, onSelectTab }: BottomDockProps) {
  const insets = useSafeAreaInsets()

  return (
    // Full-width tab bar rather than a floating pill: edge to edge, opaque,
    // with a hairline above it and a text label under each icon.
    <View style={[styles.bar, { height: DOCK_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      {TABS.map(({ tab, label, Icon }) => {
        const isActive = activeTab === tab
        return (
          <PressableScale
            key={tab}
            onPress={() => onSelectTab(tab)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            style={styles.tabButton}
          >
            {/* Inactive icons use textMuted at full opacity rather than a
                lighter color plus reduced opacity — combining the two
                compounds into a contrast failure. textMuted is already the
                deliberately-engineered "muted" tier (see theme.ts). */}
            <Icon size={24} color={isActive ? colors.accentPrimary : colors.textMuted} />
            <Text
              style={[
                typography.statLabel,
                { color: isActive ? colors.accentPrimary : colors.textMuted },
              ]}
            >
              {label}
            </Text>
          </PressableScale>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.bgAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
})
