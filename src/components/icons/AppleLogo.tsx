import Svg, { Path } from 'react-native-svg'

interface AppleLogoProps {
  size?: number
  color?: string
}

// The Apple mark, filled — a brand logo is reproduced as-is rather than
// redrawn in the app's stroke-icon language, the same way SparkMark isn't
// used for these; recognizability matters more than house style here.
export function AppleLogo({ size = 20, color = '#FFFFFF' }: AppleLogoProps) {
  return (
    <Svg width={size} height={size * (20.5 / 17)} viewBox="0 0 170 210" fill="none">
      <Path
        fill={color}
        d="M138.7 111.5c-.3-27.3 22.3-40.4 23.3-41-12.7-18.6-32.5-21.1-39.6-21.4-16.9-1.7-33 10-41.6 10-8.7 0-21.8-9.8-35.9-9.5-18.5.3-35.5 10.8-45 27.2-19.2 33.3-4.9 82.5 13.8 109.5 9.1 13.2 20 28 34.3 27.5 13.7-.5 18.9-8.9 35.5-8.9 16.5 0 21.3 8.9 35.8 8.6 14.8-.2 24.2-13.4 33.3-26.7 10.5-15.3 14.8-30.1 15-30.9-.3-.1-28.7-11-29-43.4Z"
      />
      <Path
        fill={color}
        d="M112.9 30.5c7.6-9.2 12.7-22 11.3-34.8-11 .4-24.3 7.3-32.1 16.5-7 8.1-13.2 21.2-11.5 33.6 12.2 1 24.7-6.1 32.3-15.3Z"
      />
    </Svg>
  )
}
