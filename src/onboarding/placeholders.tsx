import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg'
import type { LayerKey } from './sceneAssets'

// PLACEHOLDER ART — engineering stand-ins only, NOT the visual benchmark.
//
// These exist so the layering, parallax, camera push and state flow can be
// built and tested before the production layers are delivered. They are
// deliberately plain. Do not polish them into pseudo-final assets: delete this
// file once every entry in sceneAssets.ts has a real `source`.

interface PlaceholderProps {
  width: number
  height: number
}

function Background({ width, height }: PlaceholderProps) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4A3A78" />
          <Stop offset="0.5" stopColor="#8A6BA8" />
          <Stop offset="1" stopColor="#E9B98F" />
        </LinearGradient>
        <RadialGradient id="warm" cx="0.8" cy="0.55" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#FFD9A8" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFD9A8" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#bg)" />
      <Rect width={width} height={height} fill="url(#warm)" />
    </Svg>
  )
}

function Glow({ width, height }: PlaceholderProps) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id="glow" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#E6D4FF" stopOpacity="0.95" />
          <Stop offset="0.35" stopColor="#B994F0" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#B994F0" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill="url(#glow)" />
    </Svg>
  )
}

// Ledge Rook stands on, plus a soft floor fade.
function Midground({ width, height }: PlaceholderProps) {
  const ledgeTop = height * 0.7
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="ledge" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D9C6B0" />
          <Stop offset="1" stopColor="#9C8296" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={ledgeTop} width={width} height={height - ledgeTop} fill="url(#ledge)" />
    </Svg>
  )
}

function Foliage({ width, height }: PlaceholderProps) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id="leaf" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#4B4A3A" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#4B4A3A" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2.4} fill="url(#leaf)" />
    </Svg>
  )
}

const PLACEHOLDERS: Partial<Record<LayerKey, (p: PlaceholderProps) => React.JSX.Element>> = {
  background: Background,
  glow: Glow,
  midground: Midground,
  foregroundLeft: Foliage,
  foregroundRight: Foliage,
}

export function renderPlaceholder(key: LayerKey, width: number, height: number) {
  const Component = PLACEHOLDERS[key]
  return Component ? <Component width={width} height={height} /> : null
}
