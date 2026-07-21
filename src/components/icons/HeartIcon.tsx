import Svg, { Path } from 'react-native-svg'

interface HeartIconProps {
  size?: number
  color: string
  filled?: boolean
}

const HEART_PATH =
  'M12 20.2c-.25 0-.5-.08-.7-.24C7.9 17.4 4 14.02 4 9.9 4 7.2 6.1 5 8.7 5c1.35 0 2.6.6 3.3 1.6.7-1 1.95-1.6 3.3-1.6 2.6 0 4.7 2.2 4.7 4.9 0 4.12-3.9 7.5-7.3 10.06-.2.16-.45.24-.7.24z'

// A rounded heart, single stroke or filled — matches the app's rounded-cap
// stroke language rather than the unicode ♡/♥︎ glyphs it replaces.
export function HeartIcon({ size = 24, color, filled = false }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={HEART_PATH}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  )
}
