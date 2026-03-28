const BASE    = 'https://us1.make.com/api/v2'
const headers = () => ({
  Authorization:  `Token ${process.env.MAKE_API_TOKEN}`,
  'Content-Type': 'application/json',
})

export interface MakeScenario {
  id:       number
  name:     string
  isActive: boolean
  teamId:   number
}

export async function getScenarios(): Promise<MakeScenario[]> {
  const res  = await fetch(
    `${BASE}/scenarios?teamId=${process.env.MAKE_TEAM_ID}&pg[limit]=100`,
    { headers: headers(), next: { revalidate: 30 } }
  )
  const data = await res.json()
  return data.scenarios ?? []
}

export async function activateScenario(id: number): Promise<void> {
  await fetch(`${BASE}/scenarios/${id}`, {
    method:  'PATCH',
    headers: headers(),
    body:    JSON.stringify({ scheduling: { type: 'indefinitely' } }),
  })
}

export async function deactivateScenario(id: number): Promise<void> {
  await fetch(`${BASE}/scenarios/${id}`, {
    method:  'PATCH',
    headers: headers(),
    body:    JSON.stringify({ scheduling: { type: 'ondemand' } }),
  })
}

export function makeScenarioEditUrl(orgId: string, scenarioId: number) {
  return `https://us1.make.com/${orgId}/scenarios/${scenarioId}/edit`
}
