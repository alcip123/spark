import Svg, { Line, Polyline } from 'react-native-svg'

interface ArrowLeftIconProps {
  size?: number
  color: string
}

// Back arrow for the fact screen. Same 1.6 stroke and rounded caps as the
// other icons, so it sits in the set rather than looking borrowed — and an
// SVG rather than a text glyph, per the project's icon rule.
export function ArrowLeftIcon({ size = 24, color }: ArrowLeftIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={19} y1={12} x2={5.6} y2={12} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Polyline
        points="11.4,5.6 5,12 11.4,18.4"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
