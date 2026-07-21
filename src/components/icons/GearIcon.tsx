import Svg, { Circle, Path } from 'react-native-svg'

interface GearIconProps {
  size?: number
  color: string
}

// A settings gear: outer circle + 6 evenly-spaced teeth, single stroke, no
// fill — matches SparkMark/DiscoverIcon/ProfileIcon's rounded-cap, thin-stroke
// language rather than a solid glyph-font gear.
export function GearIcon({ size = 24, color }: GearIconProps) {
  const teeth = Array.from({ length: 6 }, (_, i) => (i * 60 * Math.PI) / 180)
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {teeth.map((angle, i) => {
        const x1 = 12 + Math.cos(angle) * 7.4
        const y1 = 12 + Math.sin(angle) * 7.4
        const x2 = 12 + Math.cos(angle) * 9.6
        const y2 = 12 + Math.sin(angle) * 9.6
        return (
          <Path
            key={i}
            d={`M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`}
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        )
      })}
      <Circle cx={12} cy={12} r={5.6} stroke={color} strokeWidth={1.6} />
      <Circle cx={12} cy={12} r={1.6} stroke={color} strokeWidth={1.6} />
    </Svg>
  )
}
