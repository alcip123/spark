// Slop filter for facts.json — flags encyclopedia-style, hedged, definitional,
// and generic entries that don't match the Spark fact style (one crisp,
// surprising, specific claim).
const facts = require('../src/data/facts.json')

const SLOP_PATTERNS = [
  // Hedged/generic openers
  /^some (species|traditional|types|varieties|cultures|regions|historians|scientists|researchers)/i,
  /^many (species|traditional|cultures|regions|historians|scientists)/i,
  /^in (some|many) (cultures|regions|countries|traditions)/i,
  // Wikipedia-lead person intros
  /^the (actor|actress|musician|singer|artist|painter|composer|sculptor|scientist|psychologist|philosopher|explorer|polymath|writer|author|poet|inventor|mathematician|physicist|chemist|astronomer|architect|director|dancer|athlete|chef)\b/i,
  // Definitional/textbook phrasing
  /^the (concept|term|idea|practice|tradition|technique|style|notion) of/i,
  /^(a|an) ["“]?[\w\s-]+["”]? (refers to|describes|classifies|is defined as) /i,
  /\b(refers to|is defined as|describes how|classifies)\b/i,
  // Encyclopedia descriptors
  /\bknown for\b/i,
  /\b(is|are) (a|an|one of the) [\w\s,-]*(known|celebrated|renowned|famous|notable|prominent|popular|beloved|iconic) /i,
  /\bconsidered (one of|to be|among)\b/i,
  /\b(significant|important|lasting|profound|major) (contributions?|influence|impact|role)\b/i,
  /\bplays? an? (central|key|vital|important|crucial|significant) role\b/i,
  /\bdeeply (embedded|rooted|ingrained|intertwined)\b/i,
  /\bcentral to (much|many|the)\b/i,
  /\brich (cultural|culinary|musical|artistic) (heritage|tradition|history)\b/i,
  /\bcultural (significance|importance|heritage)\b/i,
  /\b(a|an) (staple|cornerstone|hallmark|mainstay) (of|in)\b/i,
  // Vague quantifiers & weasels
  /\b(various|numerous|a variety of|a wide range of|many different)\b/i,
  /\b(often|typically|traditionally|commonly|frequently|generally|usually) (served|prepared|used|associated|regarded|seen|considered|featured|performed|eaten|worn|celebrated)\b/i,
  /\b(believed to|thought to|said to|tied to legends|according to legend)\b/i,
  /\b(helps?|helped) (to )?(standardize|establish|shape|define|maintain|improve)\b/i,
  // Dry mission/instrument catalog entries
  /\b(mission|telescope|observatory|spacecraft|probe|satellite) (observes|studies|monitors|measures|maps|tracks)\b/i,
  // Board game catalog spam
  /\bboard game\b/i,
  /\bcard game .*(uses|features|combines|simulates)\b/i,
  /\b(uses|features|combines) [\w\s,-]*(mechanics|gameplay|cards?) /i,
  // Generic anatomy/science textbook
  /\b(joint|bone|muscle|organ) that allows\b/i,
  /\bin response to (physical|environmental)\b/i,
  /\bthroughout (a person's|their) (life|lives)\b/i,
  // Blandness markers
  /\b(everyday|daily) (social )?life\b/i,
  /\b(left|leaves) a lasting\b/i,
  /\bexpressive [\w]+ style\b/i,
  /\bdistinct regional style\b/i,
  /\b(blends?|blending) [\w\s,-]+ influences\b/i,
  /\bacross many (overlapping )?\b/i,
  /\b(emphasizes|emphasizing) (rapid|precise|careful|slow)\b/i,
  /\bdevelop(ed)? highly personalized\b/i,
  // Round 2: catalog-series and weasel-superlative slop that survived
  /^the first widely (used|available|adopted)\b/i,
  /\bhelp(s|ed)? (popularize|protect|standardize|establish|shape|improve|regulate|support)\b/i,
  /\bcombin(es?|ing) [\w\s,'-]+ with\b/i,
  /\bremains? (a popular|an important|an active|one of)\b/i,
  /\b(is|are) among the\b/i,
  /\bsome of the (most|oldest|largest|finest|best|rarest)\b/i,
  /\bone of the (oldest|rarest|largest|finest|leading|most)\b/i,
  /\bcontinuously inhabited\b/i,
  /\b(is|are) (linked|associated) (to|with)\b/i,
  /\bsignificantly (affects?|influences?|impacts?)\b/i,
  /^(a|an) ["“]/i,
  /\bmost people (associate|think of|recognize)\b/i,
  /\bmajor (economic|cultural|industrial|commercial) (center|hub|power)\b/i,
  /\bhistorically developed\b/i,
  /\bdistinctive elements\b/i,
  /\bcommonly raised\b/i,
  /\brapid advances\b/i,
  /^some \w+ (have|has) been found\b/i,
  /\brequires regular\b/i,
  /\b(displays?|performs?) (some of|an? (elaborate|intricate|complex)) [\w\s,'-]*(among|involving|of)\b.*species\b/i,
  // Round 3: generated series and almanac filler
  /^some (athletes|players|runners|swimmers|climbers|cyclists) use\b/i,
  /\bsport-specific\b/i,
  /\bbreed (is|are) raised\b/i,
  /\bdoubled as both\b/i,
  /\baims? to (replicate|capture|convey|express)\b/i,
  /\b(traditionally|typically) (depicts?|consists? of|includes?|features?)\b/i,
  /\boversaw a period of\b/i,
  /\bone of the \w+est\b/i,
  /\bone of the (most|least) \w+/i,
  /\bhighest (percentages?|concentrations?|proportions?) of\b/i,
  /\bsuited to (cold|hot|harsh|extreme)\b/i,
  /\bforms? part of the border\b/i,
  /\b(major|dominant) rival power\b/i,
  /\bexisted decades before\b/i,
  // Round 4: remaining generated series
  /^the human [\w\s-]+ cells?\b/i,
  /^the (economist|historian|journalist|activist|entrepreneur|photographer|designer|engineer|biologist|geologist|anthropologist|linguist)\b/i,
  /\b(is|are) being studied by\b/i,
  /\bhas (researched|studied|explored|examined) the\b/i,
]

// Signature Spark formats that must never be cut, whatever else matches
const RESCUE_PATTERNS = [
  /\bis called an? ["'“]?[\w-]+["'”]?\.?$/i, // "A group of X is called a Y."
]

function isSlop(text) {
  if (RESCUE_PATTERNS.some((p) => p.test(text))) return false
  return SLOP_PATTERNS.some((p) => p.test(text))
}

const cut = facts.filter((f) => isSlop(f.text))
const kept = facts.filter((f) => !isSlop(f.text))

// Dedupe kept facts by normalized text
const seen = new Set()
const deduped = []
let dupes = 0
for (const f of kept) {
  const key = f.text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  if (seen.has(key)) { dupes++; continue }
  seen.add(key)
  deduped.push(f)
}

const mode = process.argv[2]
const pick = (arr, n) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a.slice(0, n) }

if (mode === 'cut') {
  pick(cut, 40).forEach((f) => console.log('[CUT] ' + f.text))
} else if (mode === 'kept') {
  pick(deduped, 40).forEach((f) => console.log('[KEPT] ' + f.text))
} else if (mode === 'write') {
  require('fs').writeFileSync(require('path').join(__dirname, '../src/data/facts.json'), JSON.stringify(deduped, null, 1))
  console.log('written:', deduped.length)
} else {
  console.log('total:', facts.length, '| cut:', cut.length, '| dupes:', dupes, '| kept:', deduped.length)
  const by = {}
  deduped.forEach((x) => (by[x.categorySlug] = (by[x.categorySlug] || 0) + 1))
  console.log(by)
}
