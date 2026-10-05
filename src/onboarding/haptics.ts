import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

// Haptics has no web implementation; guard rather than let it reject.
export function lightImpact(): void {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}
