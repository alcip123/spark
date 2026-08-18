// One-off conversion script: content/spark_facts.txt -> spark/src/data/facts.json
//
// spark_facts.txt lives in content/ (one level above spark/) and is
// hand-curated by the user, not regenerated automatically. If more facts are
// appended there later, rerun this script (`npx tsx scripts/convert-facts.ts`
// from inside spark/) and commit the regenerated facts.json.
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Fact } from '../src/types'
import { mapTagsToCategory } from './tagCategoryMap'

const SOURCE_PATH = path.join(__dirname, '..', '..', 'content', 'spark_facts.txt')
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'facts.json')

// Simple stable hash (djb2) so fact IDs survive reordering/insertion in the
// source file later (unlike a positional index), which matters once
// bookmarks/likes start persisting fact IDs.
function hashId(text: string): string {
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i)
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0')
  return `f-${hex}`
}

function parseLine(line: string): { text: string; tags: string[] } | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  const lastDot = trimmed.lastIndexOf('.')
  if (lastDot === -1) {
    throw new Error(`Line has no period, cannot split text from tags: "${trimmed}"`)
  }

  let text = trimmed.slice(0, lastDot + 1)
  let tagsPart = trimmed.slice(lastDot + 1)

  // Edge case (~57 lines): sentence ends `word."` — the closing quote sits
  // after the period, so a naive split leaves a stray leading `"` on the
  // first tag. Strip it and keep it as part of the sentence text instead.
  if (tagsPart.startsWith('"')) {
    text += '"'
    tagsPart = tagsPart.slice(1)
  }

  const tags = tagsPart
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
  const uniqueTags = Array.from(new Set(tags))

  return { text, tags: uniqueTags }
}

function main() {
  const raw = fs.readFileSync(SOURCE_PATH, 'utf-8')
  const lines = raw.split('\n')
  const nonBlankLines = lines.filter((l) => l.trim().length > 0)

  const facts: Fact[] = []
  for (const line of nonBlankLines) {
    const parsed = parseLine(line)
    if (!parsed) continue
    const { text, tags } = parsed
    const categorySlug = mapTagsToCategory(tags)
    facts.push({
      id: hashId(text),
      text,
      categorySlug,
      tags,
    })
  }

  // Sanity checks — fail loudly rather than silently shipping bad data.
  if (facts.length !== nonBlankLines.length) {
    throw new Error(
      `Line count mismatch: ${nonBlankLines.length} input lines but ${facts.length} facts produced`
    )
  }
  const badTag = facts.find((f) => f.tags.some((t) => t.includes('"')))
  if (badTag) {
    throw new Error(`Found a tag containing a stray quote character: ${JSON.stringify(badTag)}`)
  }
  const idCounts = new Map<string, number>()
  for (const f of facts) {
    idCounts.set(f.id, (idCounts.get(f.id) ?? 0) + 1)
  }
  const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1)
  if (duplicateIds.length > 0) {
    console.warn(
      `Warning: ${duplicateIds.length} hash collisions/duplicate texts found (kept as-is):`,
      duplicateIds.slice(0, 5)
    )
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(facts, null, 2) + '\n', 'utf-8')

  // Summary for manual review.
  const perCategory = new Map<string, number>()
  for (const f of facts) {
    perCategory.set(f.categorySlug, (perCategory.get(f.categorySlug) ?? 0) + 1)
  }
  console.log(`\nConverted ${facts.length} facts -> ${OUTPUT_PATH}\n`)
  console.log('Per-category counts:')
  for (const [slug, count] of [...perCategory.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${slug.padEnd(12)} ${count}`)
  }

  console.log('\nRandom sample (15 facts) for a manual skim:')
  const sampleIndices = new Set<number>()
  while (sampleIndices.size < Math.min(15, facts.length)) {
    sampleIndices.add(Math.floor(Math.random() * facts.length))
  }
  for (const i of sampleIndices) {
    const f = facts[i]
    console.log(`  [${f.categorySlug}] ${f.text}`)
  }
}

main()
