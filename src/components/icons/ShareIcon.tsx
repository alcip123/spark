import Svg, { Path, Polyline, Line } from 'react-native-svg'

interface ShareIconProps {
  size?: number
  color: string
}

// An upward share arrow with a tray, matching the outbound-share convention
// (iOS share-sheet glyph shape) rendered in the app's stroke language.
export function ShareIcon({ size = 24, color }: ShareIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="8.2,9.4 12,5.4 15.8,9.4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={5.4} x2={12} y2={15.4} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path
        d="M6 12.6v4.4c0 .9.7 1.6 1.6 1.6h8.8c.9 0 1.6-.7 1.6-1.6v-4.4"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}
