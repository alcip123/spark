import Svg, { G, Line, Path } from 'react-native-svg'
import { SPARK_INNER_TRANSFORM, SPARK_ROTATE_TRANSFORM, SPARK_STROKES } from './sparkGeometry'

interface SparkMarkProps {
  size?: number
  color: string
}

// Static, rest-position rendering of the Spark brand mark — the same 10-stroke
// geometry AnimatedSplash bursts on launch, shrunk to icon scale. Rendered in
// one flat color rather than the splash's per-stroke lavender shades: at this
// size the tonal nuance wouldn't read, and a single color reads as an icon
// rather than a miniature illustration.
export function SparkMark({ size = 26, color }: SparkMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <G transform={SPARK_INNER_TRANSFORM}>
        <G transform={SPARK_ROTATE_TRANSFORM} strokeLinecap="round">
          {SPARK_STROKES.map((spec, i) =>
            spec.d ? (
              <Path key={i} d={spec.d} stroke={color} strokeWidth={spec.width} fill="none" />
            ) : (
              <Line key={i} x1={spec.x1} y1={spec.y1} x2={spec.x2} y2={spec.y2} stroke={color} strokeWidth={spec.width} />
            )
          )}
        </G>
      </G>
    </Svg>
  )
}
