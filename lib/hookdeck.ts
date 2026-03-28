const BASE    = 'https://api.hookdeck.com/2024-09-01'
const headers = () => ({
  Authorization:  `Bearer ${process.env.HOOKDECK_API_KEY}`,
  'Content-Type': 'application/json',
})

export interface HookdeckSource {
  id:   string
  name: string
  url:  string
}

export interface HookdeckDestination {
  id:   string
  name: string
  url:  string
}

export interface HookdeckConnection {
  id:          string
  name:        string
  paused_at:   string | null
  source:      HookdeckSource
  destination: HookdeckDestination
}

async function hookdeckGet<T>(path: string): Promise<T[]> {
  const res  = await fetch(`${BASE}${path}`, { headers: headers(), next: { revalidate: 60 } })
  const data = await res.json()
  return data.models ?? []
}

export const getSources      = () => hookdeckGet<HookdeckSource>('/sources')
export const getDestinations = () => hookdeckGet<HookdeckDestination>('/destinations')
export const getConnections  = () => hookdeckGet<HookdeckConnection>('/connections')

export async function pauseConnection(id: string): Promise<void> {
  await fetch(`${BASE}/connections/${id}/pause`, { method: 'PUT', headers: headers() })
}

export async function unpauseConnection(id: string): Promise<void> {
  await fetch(`${BASE}/connections/${id}/unpause`, { method: 'PUT', headers: headers() })
}
