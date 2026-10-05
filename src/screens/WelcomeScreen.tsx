// @deprecated — superseded by src/onboarding/OnboardingScene.tsx (the portal /
// Rook scene). No longer imported anywhere; kept until the new onboarding is
// approved on-device, then delete.
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { PopButton } from '../components/PopButton'
import { spacing } from '../theme'

interface WelcomeScreenProps {
  onContinue: () => void
}

// "Quiet Curiosity Nook" welcome screen, matched to the approved reference
// image at OneDrive/Desktop/Spark/New Design Idea/ChatGPT Spark Onboarding
// Files/assets/Final Onboarding Reference.png (spec: 02-onboarding-screen-spec.md).
// Colors are the reference's own warm-paper/plum palette, deliberately
// separate from the app's cool-modern theme — a one-off creative direction
// for this screen, not a global retheme. Static; the Rive entrance/idle
// animation is a later pass.
const ROOK = {
  paper: '#F6F1E8',
  archBorder: '#3D2A4D',
  skyTop: '#8E86B0', // dusk lavender-blue
  skyMid: '#C9A9C9', // muted mauve
  skyBottom: '#F3E1C4', // warm dusk cream
  ledge: '#EADFC7',
  headline: '#2D2431',
  buttonFill: '#4E3563',
  buttonText: '#FFF5DD',
}

// Arch outline in a 0-100 box: flat sides down to a flat bottom ledge, a
// true semicircle top (radius = half the box width).
const ARCH_PATH = 'M2,100 L2,48 A48,48 0 0 1 98,48 L98,100 Z'

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.page}>
      <View style={styles.arch}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={ROOK.skyTop} />
              <Stop offset="0.55" stopColor={ROOK.skyMid} />
              <Stop offset="1" stopColor={ROOK.skyBottom} />
            </LinearGradient>
          </Defs>
          <Path d={ARCH_PATH} fill="url(#sky)" stroke={ROOK.archBorder} strokeWidth={3} />
          {/* Window-light beams, evening light falling in from the upper right */}
          <Path d="M55,0 L98,28 L98,48 L70,48 Z" fill="#FFF3D6" opacity={0.22} />
          <Path d="M75,0 L98,12 L98,30 L85,20 Z" fill="#FFF3D6" opacity={0.18} />
          <Rect x="2" y="90" width="96" height="10" fill={ROOK.ledge} opacity={0.9} />
        </Svg>

        <Image
          source={require('../../assets/mascot/rook.png')}
          style={styles.rook}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headlineArea}>
        <Text style={styles.headlineSans}>Find your</Text>
        <Text style={styles.headlineSerif}>Spark.</Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={[styles.buttonArea, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PopButton
          label="GET STARTED"
          onPress={onContinue}
          backgroundColor={ROOK.buttonFill}
          textColor={ROOK.buttonText}
          fullWidth
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: ROOK.paper,
    paddingHorizontal: '7%',
  },
  arch: {
    marginTop: '8%',
    height: '46%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rook: {
    position: 'absolute',
    bottom: '10%',
    left: '18%',
    width: '45%',
    height: '65%',
  },
  headlineArea: {
    marginTop: spacing.xl,
  },
  headlineSans: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 28,
    color: ROOK.headline,
  },
  headlineSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    fontSize: 44,
    lineHeight: 50,
    color: ROOK.headline,
  },
  buttonArea: {
    paddingTop: spacing.md,
  },
})
