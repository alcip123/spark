import { Appearance, Platform } from 'react-native'

// "Cool Modern" design tokens, translated from CSS custom properties into
// RN-usable constants. This is the single source of truth for color,
// typography, spacing, radii, and shadow values — new components should pull
// from here rather than hardcoding values.

const lightColors = {
  bg: '#F6F5F3',
  bgAlt: '#FFFFFF',

  accentPrimary: '#8A82C4',
  accentPrimaryPressed: '#7A73B0', // RN has no hover; used as the pressed/active state

  illustrationFill1: '#E4E0F5',
  illustrationFill2: '#E9E7F9',
  illustrationIcon: '#7A73B0',

  textPrimary: '#2B2E38',
  textSecondary: '#6B7180',
  // Matches textSecondary by value: anything lighter fails WCAG 4.5:1 for the
  // small text this tier labels (captions, placeholders, stat labels). The
  // "muted" tier is expressed through size/weight, not a lighter gray.
  textMuted: '#6B7180',

  // Text/icons sitting on accentPrimary surfaces
  onAccent: '#FFFFFF',

  border: '#D8D6D2',
  borderAccent: '#C7C2DE',

  footerBg: '#2B2E38',
  footerText: '#F6F5F3',

  shadow: 'rgba(43,46,56,0.10)',
  shadowSoft: 'rgba(43,46,56,0.08)',
  shadowAccent: 'rgba(138,130,196,0.35)',
}

// Dark is not an inversion: depth comes from surface lightness (bg → bgAlt
// steps lighter, not shadow), the lavender accent lightens a step so it holds
// against the dark ground, and on-accent text flips to ink. Every hue stays
// in the same slate/lavender family as light mode.
const darkColors: typeof lightColors = {
  bg: '#1C1E26', // deep slate-ink, faintly lavender
  bgAlt: '#272935', // elevated surface: one lightness step up, same hue

  accentPrimary: '#968FD0',
  accentPrimaryPressed: '#A69FDA',

  illustrationFill1: '#34324A',
  illustrationFill2: '#3A3852',
  illustrationIcon: '#A9A3DC',

  textPrimary: '#ECEBF2',
  textSecondary: '#A8ACBC',
  textMuted: '#A8ACBC',

  // Ink-on-lavender: light text on the lightened dark-mode accent would fall
  // below contrast; the dark ground itself becomes the on-accent color.
  onAccent: '#1C1E26',

  border: '#3A3D4D',
  borderAccent: '#4A4766',

  footerBg: '#12131A',
  footerText: '#ECEBF2',

  shadow: 'rgba(0,0,0,0.35)',
  shadowSoft: 'rgba(0,0,0,0.30)',
  shadowAccent: 'rgba(150,143,208,0.30)',
}

// Resolved once at launch from the system setting (app.json sets
// userInterfaceStyle "automatic"). Styles are built statically at module load
// throughout the app, so a mid-session system theme change applies on next
// launch (web: reload) rather than live — an accepted tradeoff for now.
export const colorScheme: 'light' | 'dark' = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'

export const colors = (colorScheme === 'dark' ? darkColors : lightColors) as typeof lightColors

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const

export const radii = {
  pill: 999,
  card: 18, // spec range 16-20px
  sheet: 32,
} as const

export const borders = {
  default: { borderWidth: 1, borderColor: colors.border },
  accent: { borderWidth: 1.5, borderColor: colors.borderAccent },
} as const

// Georgia isn't a real font on Android; 'serif' is a genuine generic system
// family alias there (not a placeholder), so it's a legitimate fallback.
const fontSerif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' })

// Manrope needs distinct family names per weight in RN — it cannot synthesize
// weights from a single loaded file the way CSS font-weight does. These names
// match the exports of @expo-google-fonts/manrope and must be loaded via
// useFonts before any of these text styles are rendered.
const manrope = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
}

// RN shadow props (iOS) + elevation (Android). Android's elevation shadow is
// grayscale-only in RN's standard API, so `shadowAccent`'s lavender tint will
// only render on iOS; Android falls back to a plain gray elevation shadow.
// Accepted MVP tradeoff, not a bug.
export const shadows = {
  card: {
    shadowColor: colors.shadowSoft,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  sheet: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  button: {
    shadowColor: colors.shadowAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
} as const

export const typography = {
  display: { fontFamily: fontSerif, fontWeight: '600' as const, fontSize: 44, lineHeight: 44 * 1.1, color: colors.textPrimary },
  h1: { fontFamily: fontSerif, fontWeight: '600' as const, fontSize: 32, lineHeight: 32 * 1.15, color: colors.textPrimary },
  h2: { fontFamily: fontSerif, fontWeight: '600' as const, fontSize: 24, lineHeight: 24 * 1.2, color: colors.textPrimary },
  bodyLg: { fontFamily: manrope.medium, fontSize: 18, lineHeight: 18 * 1.5, color: colors.textPrimary },
  body: { fontFamily: manrope.medium, fontSize: 16, lineHeight: 16 * 1.5, color: colors.textPrimary },
  button: { fontFamily: manrope.bold, fontSize: 17, lineHeight: 17, color: colors.onAccent },
  statNum: { fontFamily: fontSerif, fontWeight: '600' as const, fontSize: 20, lineHeight: 20, color: colors.textPrimary },
  statLabel: { fontFamily: manrope.semiBold, fontSize: 11, lineHeight: 11 * 1.3, color: colors.textMuted },
  // Extra convenience style used for the fact card's category label, not in
  // the original token doc but follows the same sans/muted pattern.
  caption: { fontFamily: manrope.semiBold, fontSize: 13, lineHeight: 13 * 1.3, color: colors.textSecondary },
} as const

export const layout = {
  maxContentWidth: 360, // spec range 340-380px, used for onboarding/settings mockup-style screens
  // Reading-measure cap for the fact text on tablets/large windows — keeps
  // line length in a comfortable range instead of stretching edge to edge.
  maxReadingWidth: 600,
} as const

export const manropeWeights = manrope
