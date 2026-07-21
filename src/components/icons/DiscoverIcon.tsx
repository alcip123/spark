import Svg, { Circle, Line } from 'react-native-svg'

interface DiscoverIconProps {
  size?: number
  color: string
}

// A compass: circle outline + a short off-center needle, in the same
// rounded-cap, thin-stroke language as SparkMark — deliberately not a
// sparkle/star shape so it doesn't compete with the Spark mark next to it.
export function DiscoverIcon({ size = 24, color }: DiscoverIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Line x1={14.6} y1={8.6} x2={10.6} y2={11.4} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={10.6} y1={11.4} x2={9.4} y2={15.4} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  )
}
