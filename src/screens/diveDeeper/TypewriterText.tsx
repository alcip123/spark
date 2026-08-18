import { useEffect, useRef, useState } from 'react'
import { Text, type StyleProp, type TextStyle } from 'react-native'

// 250 wpm at the standard 5-chars-per-word convention.
const CHARS_PER_MS = (250 * 5) / 60_000

interface TypewriterTextProps {
  text: string
  style?: StyleProp<TextStyle>
}

// Reveals `text` character-by-character rather than all at once — used only
// for the assistant reply that just arrived (see DiveDeeperScreen's
// typewriterIndex), never replayed for older messages already on screen.
//
// Driven by elapsed wall-clock time (rAF) rather than a setInterval tick
// count: a tick-counting timer falls behind under render load and never
// catches up, which read as sluggish regardless of how fast MS_PER_CHAR was
// set. Computing count from elapsed time self-corrects every frame.
export function TypewriterText({ text, style }: TypewriterTextProps) {
  const [count, setCount] = useState(0)
  const startRef = useRef(0)

  useEffect(() => {
    setCount(0)
    if (!text) return
    startRef.current = Date.now()
    let frame: number
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const next = Math.min(text.length, Math.floor(elapsed * CHARS_PER_MS))
      setCount(next)
      if (next < text.length) {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text])

  return <Text style={style}>{text.slice(0, count)}</Text>
}
