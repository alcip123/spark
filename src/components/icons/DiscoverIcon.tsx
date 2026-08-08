import Svg, { Circle, Line, Path } from 'react-native-svg'

interface DiscoverIconProps {
  size?: number
  color: string
}

// Redesigned compass (sourced from the Figma "Compass design adaptation"
// exploration): outer ring + N/S/E/W ticks + a two-tone needle (filled NE
// half, outline SW half) + center pivot dot. Rendered larger (30pt default)
// than sibling dock icons to anchor Discover as the dock's primary tab.
// One shared geometry for active/inactive — color is the only thing that
// should ever differ between states, so the two can't drift out of sync
// the way the earlier per-state copies did.
export function DiscoverIcon({ size = 30, color }: DiscoverIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Circle cx={15} cy={15} r={11.25} stroke={color} strokeWidth={2} />
      <Line x1={15} y1={4.75} x2={15} y2={7.25} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={15} y1={22.75} x2={15} y2={25.25} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4.75} y1={15} x2={7.25} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={22.75} y1={15} x2={25.25} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M19.419 10.5806L13.409 13.7626L16.237 16.591L19.419 10.5806Z" fill={color} />
      <Path
        d="M10.581 19.4194L13.409 13.7625L16.237 16.591L10.581 19.4194Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path d="M15 15.875C15.483 15.875 15.875 15.4832 15.875 15C15.875 14.5168 15.483 14.125 15 14.125C14.517 14.125 14.125 14.5168 14.125 15C14.125 15.4832 14.517 15.875 15 15.875Z" fill={color} />
    </Svg>
  )
}
