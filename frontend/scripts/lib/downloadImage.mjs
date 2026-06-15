// Download a generated image as an optimized JPEG via the images.weserv.nl proxy.
// The direct kie CDN (tempfile.aiquickdraw.com) resets connections in some
// environments; weserv both proxies and resizes/optimizes. Falls back to direct.

export function weservUrl(imageUrl, { width = 1200, quality = 82 } = {}) {
  const stripped = imageUrl.replace(/^https?:\/\//, '')
  return `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}&w=${width}&output=jpg&q=${quality}`
}

export async function downloadAsJpeg(imageUrl, { fetchImpl = fetch, width = 1200, quality = 82 } = {}) {
  const tryFetch = async (u) => {
    const res = await fetchImpl(u)
    if (!res.ok) throw new Error(`download: HTTP ${res.status} for ${u}`)
    return new Uint8Array(await res.arrayBuffer())
  }
  try {
    return await tryFetch(weservUrl(imageUrl, { width, quality }))
  } catch {
    return await tryFetch(imageUrl)
  }
}
