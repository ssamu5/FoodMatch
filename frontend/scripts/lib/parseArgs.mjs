// Parse CLI args for the hero-image generator.
export function parseArgs(argv) {
  const out = { slug: null, missing: false, force: false, dryRun: false }
  for (const a of argv) {
    if (a === '--missing') out.missing = true
    else if (a === '--force') out.force = true
    else if (a === '--dry-run') out.dryRun = true
    else if (!a.startsWith('-') && !out.slug) out.slug = a
  }
  return out
}
