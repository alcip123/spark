// Stroke geometry copied verbatim from icon-source.svg, in its inner viewBox
// units. Endpoints are ordered inner-first (nearest the burst hub) so
// outer − inner gives each stroke's natural outward direction. Shared by
// AnimatedSplash (animated burst) and SparkMark (static dock icon) so the
// two renderings of the mark never drift apart.
export type StrokeSpec = {
  x1: number
  y1: number
  x2: number
  y2: number
  d?: string
  color: string
  width: number
}

export const SPARK_STROKES: StrokeSpec[] = [
  { x1: 12.77, y1: 9.41, x2: 12.39, y2: 5.03, color: '#7A73B0', width: 1.3 },
  { x1: 10.64, y1: 10.9, x2: 8.02, y2: 9.68, color: '#7A73B0', width: 1.15 },
  { x1: 11.51, y1: 9.87, x2: 10.42, y2: 8.31, color: '#C7C2DE', width: 0.9 },
  { x1: 14.84, y1: 10.16, x2: 17.24, y2: 7.76, color: '#8A82C4', width: 1.25 },
  { x1: 15.56, y1: 11.55, x2: 18.42, y2: 11.05, color: '#C7C2DE', width: 1.0 },
  { x1: 15.36, y1: 13.1, x2: 17.53, y2: 14.11, color: '#7A73B0', width: 1.15 },
  { x1: 14.1, y1: 14.36, x2: 14.82, y2: 15.9, color: '#8A82C4', width: 1.0 },
  { x1: 12.55, y1: 14.56, x2: 12.43, y2: 15.25, color: '#C7C2DE', width: 0.8 },
  { x1: 11.01, y1: 13.67, x2: 4.57, y2: 19.07, d: 'M11.01 13.67 Q8 16.5 4.57 19.07', color: '#8A82C4', width: 1.3 },
  { x1: 10.44, y1: 12.45, x2: 1.18, y2: 14.08, d: 'M10.44 12.45 Q6 13.5 1.18 14.08', color: '#7A73B0', width: 1.1 },
]

// The mark is drawn inside a scale(42) + rotate(-35°) group, matching the
// native splash image's composition exactly (see icon-source.svg). Any
// static rendering of the mark must reuse this same transform pair.
export const SPARK_INNER_TRANSFORM = 'translate(512 512) scale(42) translate(-11.22 -14.37)'
export const SPARK_ROTATE_TRANSFORM = 'rotate(-35 13 12)'
