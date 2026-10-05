import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { BackHandler, Modal, View } from 'react-native'
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { initAnalytics } from './src/lib/analytics'
import { AnimatedSplash, REVEAL_DELAY_MS } from './src/components/AnimatedSplash'
import { BottomDock } from './src/components/BottomDock'
import { DiveDeeperScreen } from './src/screens/DiveDeeperScreen'
import { FeedScreen } from './src/screens/FeedScreen'
import { OnboardingScene, type OnboardingPhase } from './src/onboarding/OnboardingScene'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { useFeedStore } from './src/store/feedStore'
import { useUiStore } from './src/store/uiStore'
import { colors, colorScheme } from './src/theme'

// Keep the native splash up until AnimatedSplash has mounted and can take
// over seamlessly (it renders the same logo at the same size/position).
SplashScreen.preventAutoHideAsync().catch(() => {})

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })
  const hasHydrated = useFeedStore((s) => s.hasHydrated)
  const onboardingComplete = useFeedStore((s) => s.onboardingComplete)
  const setOnboardingComplete = useFeedStore((s) => s.setOnboardingComplete)
  const activeTab = useUiStore((s) => s.activeTab)
  const setActiveTab = useUiStore((s) => s.setActiveTab)
  const openDiveDeeper = useUiStore((s) => s.openDiveDeeper)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [diveDeeperVisible, setDiveDeeperVisible] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  // Onboarding is one persistent scene driven by this phase (never persisted:
  // a cold start or reload always begins at the portal). Order:
  // welcome → entering → rookGreeting → curiosityPrompt → topicSelection →
  // signUp → (onboardingComplete) → feed.
  const [phase, setPhase] = useState<OnboardingPhase>('welcome')

  // Two independent async-readiness checks (font loading + Zustand/AsyncStorage
  // hydration) gate the first real render. Rendering before hydration finishes
  // would flash Onboarding for a returning user whose onboardingComplete=true
  // hasn't loaded from storage yet. While loading, AnimatedSplash holds the
  // static logo; once ready it bursts and reveals the screen mounting beneath.
  const ready = fontsLoaded && hasHydrated

  useEffect(() => {
    initAnalytics()
  }, [])

  // Android system Back: step back to Home from other tabs instead of exiting
  // the app. (The Settings and Dive Deeper modals already handle Back via
  // onRequestClose while visible.)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (useUiStore.getState().activeTab !== 'home') {
        setActiveTab('home')
        return true
      }
      return false
    })
    return () => sub.remove()
  }, [setActiveTab])

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {ready && (
          <Animated.View
            entering={FadeInUp.duration(600).delay(REVEAL_DELAY_MS).reduceMotion(ReduceMotion.System)}
            style={{ flex: 1 }}
          >
            {onboardingComplete ? (
              <>
                {/* Home stays mounted (hidden, not unmounted) so FlatList scroll
                    position and feed state survive tab switches. */}
                <View style={{ flex: 1, display: activeTab === 'home' ? 'flex' : 'none' }}>
                  <FeedScreen onOpenSettings={() => setSettingsVisible(true)} />
                </View>
                {activeTab === 'profile' && <ProfileScreen />}
                <BottomDock
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  onDiveDeeper={() => {
                    openDiveDeeper()
                    setDiveDeeperVisible(true)
                  }}
                />
              </>
            ) : (
              <OnboardingScene
                phase={phase}
                onPhaseChange={setPhase}
                onComplete={() => {
                  // Reset the phase with the flag so a later dev "Reset
                  // onboarding" remounts the scene at the portal, not inside.
                  setPhase('welcome')
                  setOnboardingComplete(true)
                }}
              />
            )}
          </Animated.View>
        )}
        <Modal
          visible={settingsVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <SettingsScreen onClose={() => setSettingsVisible(false)} />
        </Modal>
        <Modal
          visible={diveDeeperVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setDiveDeeperVisible(false)}
        >
          <DiveDeeperScreen onClose={() => setDiveDeeperVisible(false)} />
        </Modal>
        {!splashDone && <AnimatedSplash ready={ready} onDone={() => setSplashDone(true)} />}
        {/* Status bar icons contrast against the scheme's background */}
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </View>
    </SafeAreaProvider>
  )
}
