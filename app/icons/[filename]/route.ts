const ICON_URL =
  'https://api.vdthomes.com/storage/v1/object/public/branding_assets/logos/white_on_black.png'

export async function GET() {
  const res = await fetch(ICON_URL, { next: { revalidate: 86400 } })
  const body = await res.arrayBuffer()
  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
