import Svg, { Path } from 'react-native-svg'

interface FacebookLogoProps {
  size?: number
  color?: string
}

// The Facebook "f" mark, filled — the button itself supplies the brand blue
// background, so only the glyph (white by default) is drawn here.
export function FacebookLogo({ size = 20, color = '#FFFFFF' }: FacebookLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        d="M15.6 8.6h-2V7c0-.7.5-.9.8-.9h1.1V3.3L13.9 3.3c-2.5 0-3.1 1.9-3.1 3.1v2.2H9.2v3h1.6v9.4h2.9v-9.4h2l.3-3Z"
      />
    </Svg>
  )
}
