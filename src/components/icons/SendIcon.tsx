import Svg, { Line, Polyline } from 'react-native-svg'

interface SendIconProps {
  size?: number
  color: string
}

// A simple upward arrow for the chat send button — same shape family as
// ShareIcon's arrow, without the tray, so send and share stay visually
// distinct while sharing the app's stroke language.
export function SendIcon({ size = 24, color }: SendIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={12} y1={17.6} x2={12} y2={6.4} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Polyline points="7,11 12,6.4 17,11" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
