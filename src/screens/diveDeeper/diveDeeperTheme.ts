import { Platform } from 'react-native'
import { radii, spacing } from '../../theme'

// Dive Deeper is Spark's one deliberate departure from the "Curious Notebook"
// system (see DESIGN.md) — this is the paid screen, and it intentionally
// breaks the app's calm cream/lavender palette for a saturated, Gemini-
// inspired dark surface. These tokens are scoped to this screen only; every
// other screen keeps pulling from `../../theme`.

export const diveDeeperColors = {
  // Halftone backdrop gradient stops (bottom → mid → top), consumed directly
  // by the SVG gradients in DiveDeeperBackdrop.tsx.
  gradientBottom: '#1B3A8F',
  gradientBottomAlt: '#2A1B6E',
  gradientMid: '#B4238C',
  gradientMidAlt: '#6E2BB8',
  gradientTop: '#3A1B4E',
  gradientRim: '#E8A9D1',

  // Perimeter sweep hue-cycle stops.
  sweepBlue: '#3B6FE0',
  sweepViolet: '#8A4FE0',
  sweepMagenta: '#D63BB0',

  // Solid surfaces.
  surface: '#1A1A1E',
  surfaceAlt: '#242428',

  // Glass card fill + specular edge. Fill is deliberately low-opacity so the
  // colorful backdrop reads through the blur — a higher fill here looks like
  // a solid dark card sitting on top of the backdrop instead of glass.
  glassFill: 'rgba(36,36,44,0.32)',
  glassSpecularTop: 'rgba(255,255,255,0.22)',
  glassSpecularBottom: 'rgba(255,255,255,0)',

  textPrimary: '#F2F1F5',
  textSecondary: '#A8A6B4',

  accent: '#5B6EF5',
} as const

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

// Mirrors theme.ts's systemFont() — same System(iOS)/Inter(Android) split —
// duplicated locally rather than exported from theme.ts since it's an
// implementation detail of font resolution, not a shared color/spacing token.
function systemFont(weight: keyof typeof interWeights) {
  return Platform.OS === 'ios'
    ? { fontFamily: 'System', fontWeight: systemWeightNumeric[weight] }
    : { fontFamily: interWeights[weight] }
}

export const diveDeeperTypography = {
  h2: { ...systemFont('semiBold'), fontSize: 24, lineHeight: 24 * 1.2, color: diveDeeperColors.textPrimary },
  body: { ...systemFont('medium'), fontSize: 16, lineHeight: 16 * 1.5, color: diveDeeperColors.textPrimary },
  caption: {
    ...systemFont('semiBold'),
    fontSize: 13,
    lineHeight: 13 * 1.3,
    color: diveDeeperColors.textSecondary,
  },
} as const

// Reuse the shared spacing/radii scale — layout rhythm doesn't need to change
// just because the surface does.
export { radii, spacing }
