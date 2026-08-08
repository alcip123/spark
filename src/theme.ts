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
  // accentPrimary itself only clears WCAG at large/bold sizes (~3.2-3.5:1 on
  // bg/bgAlt); this darker lavender is for the accent used as small/regular
  // text (captions, chip labels) where the 4.5:1 floor applies.
  accentText: '#635E8D',
  // For surfaces that carry plain-weight white text (segmented control's
  // active pill, the chat bubble sent by the user) — white-on-accentPrimary
  // is only ~3.5:1, which fails for regular-weight body text. One step
  // darker clears 4.5:1 without reading as a different color.
  accentSurface: '#746DA5',

  illustrationFill1: '#E4E0F5',
  illustrationFill2: '#E9E7F9',
  illustrationIcon: '#7A73B0',

  textPrimary: '#2B2E38',
  // #6B7180 measures 4.48:1 on this bg — just under the 4.5:1 AA floor for
  // body-sized text. Darkened one step to #63697A (5.0:1) with a comfortable
  // margin; still reads as the same muted slate.
  textSecondary: '#63697A',
  // Matches textSecondary by value: anything lighter fails WCAG 4.5:1 for the
  // small text this tier labels (captions, placeholders, stat labels). The
  // "muted" tier is expressed through size/weight, not a lighter gray.
  textMuted: '#63697A',

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
  // Already clears 4.5:1 on dark-mode bg/bgAlt at this lightness — no
  // separate darker shade needed the way light mode requires.
  accentText: '#968FD0',
  // Dark mode's onAccent is ink, not white, on this accent — already clears
  // 4.5:1 as-is, so accentSurface is just accentPrimary here.
  accentSurface: '#968FD0',

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

// Inter is the Android/web substitute for San Francisco — same grotesque-
// sans geometry family (tall x-height, rounded terminals), the standard
// stand-in apps use since Apple doesn't license SF Pro off-platform. Loaded
// per-weight like Manrope was: RN can't synthesize weight from one custom
// font file, only from the 'System' family, which resolves to true San
// Francisco on iOS and supports RN's fontWeight prop directly there.
const interWeights = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const

const systemWeightNumeric: Record<keyof typeof interWeights, '400' | '500' | '600' | '700'> = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
}

function systemFont(weight: keyof typeof interWeights) {
  return Platform.OS === 'ios'
    ? { fontFamily: 'System', fontWeight: systemWeightNumeric[weight] }
    : { fontFamily: interWeights[weight] }
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

// Blur-based "glass" materials for floating chrome — Feed's settings/like/
// share buttons and the bottom dock — replacing solid bgAlt + shadows.card/
// shadows.sheet for those specific surfaces. Two tiers: a light touch for
// small floating controls, a stronger blur for the dock's larger, more
// grounded surface. `tint` matches expo-blur's BlurView prop and follows the
// already-resolved colorScheme; `borderColor` is a translucent light-
// catching edge rather than a flat gray stroke, closer to how iOS's own
// glass surfaces read.
export const glass = {
  chrome: {
    intensity: 30,
    tint: colorScheme,
    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
  },
  dock: {
    intensity: 50,
    tint: colorScheme,
    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)',
  },
} as const

export const typography = {
  display: { ...systemFont('semiBold'), fontSize: 44, lineHeight: 44 * 1.1, color: colors.textPrimary },
  h1: { ...systemFont('semiBold'), fontSize: 32, lineHeight: 32 * 1.15, color: colors.textPrimary },
  h2: { ...systemFont('semiBold'), fontSize: 24, lineHeight: 24 * 1.2, color: colors.textPrimary },
  bodyLg: { ...systemFont('medium'), fontSize: 18, lineHeight: 18 * 1.5, color: colors.textPrimary },
  body: { ...systemFont('medium'), fontSize: 16, lineHeight: 16 * 1.5, color: colors.textPrimary },
  button: { ...systemFont('bold'), fontSize: 17, lineHeight: 17, color: colors.onAccent },
  statNum: { ...systemFont('semiBold'), fontSize: 20, lineHeight: 20, color: colors.textPrimary },
  statLabel: { ...systemFont('semiBold'), fontSize: 11, lineHeight: 11 * 1.3, color: colors.textMuted },
  caption: { ...systemFont('semiBold'), fontSize: 13, lineHeight: 13 * 1.3, color: colors.textSecondary },
} as const

export const layout = {
  maxContentWidth: 360, // spec range 340-380px, used for onboarding/settings mockup-style screens
  // Reading-measure cap for the fact text on tablets/large windows — keeps
  // line length in a comfortable range instead of stretching edge to edge.
  maxReadingWidth: 600,
} as const
