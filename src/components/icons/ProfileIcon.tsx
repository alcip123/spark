import Svg, { Circle, Path } from 'react-native-svg'

interface ProfileIconProps {
  size?: number
  color: string
}

// A person silhouette: head circle + shoulder arc, single stroke, no fill —
// the standard minimal-line profile glyph, matching SparkMark/DiscoverIcon's
// rounded-cap, thin-stroke language.
export function ProfileIcon({ size = 24, color }: ProfileIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.4} r={3.4} stroke={color} strokeWidth={1.6} />
      <Path
        d="M5.5 19.2c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  )
}
