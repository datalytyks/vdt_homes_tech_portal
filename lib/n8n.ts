const base    = () => process.env.N8N_BASE_URL!
const headers = () => ({
  'X-N8N-API-KEY':  process.env.N8N_API_KEY!,
  'Content-Type': 'application/json',
})

export interface N8nWorkflow {
  id:     string
  name:   string
  active: boolean
}

export async function getWorkflows(): Promise<N8nWorkflow[]> {
  const res  = await fetch(`${base()}/workflows?limit=100`, {
    headers: headers(),
    next:    { revalidate: 30 },
  })
  const data = await res.json()
  return data.data ?? []
}

export async function activateWorkflow(id: string): Promise<void> {
  await fetch(`${base()}/workflows/${id}/activate`, { method: 'POST', headers: headers() })
}

export async function deactivateWorkflow(id: string): Promise<void> {
  await fetch(`${base()}/workflows/${id}/deactivate`, { method: 'POST', headers: headers() })
}

export function n8nWorkflowEditUrl(id: string) {
  return `${process.env.N8N_INSTANCE_URL}/workflow/${id}`
}
