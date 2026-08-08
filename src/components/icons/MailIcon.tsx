import Svg, { Path, Rect } from 'react-native-svg'

interface MailIconProps {
  size?: number
  color: string
}

// An envelope: rounded rect + a chevron fold, matching the app's rounded-cap,
// thin-stroke icon language (DiscoverIcon, GearIcon, etc.) — unlike the Apple
// and Facebook marks, this isn't a brand logo, so it stays in-system.
export function MailIcon({ size = 20, color }: MailIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5.5} width={18} height={13} rx={2.4} stroke={color} strokeWidth={1.6} />
      <Path
        d="M4 7 L12 13 L20 7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}
