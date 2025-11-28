import shortcutsData from '../data/shortcuts.json'

export const prerender = true

export async function GET() {
  return new Response(JSON.stringify(shortcutsData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
  })
}

