// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Zustand v5's ESM build uses `import.meta.env`, which Metro's web bundler
// serves as a classic (non-module) script — Hermes/browser can't parse it.
// Forcing CommonJS resolution for browser/require avoids the ESM build.
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native']

module.exports = config
