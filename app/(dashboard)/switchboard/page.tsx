import { getConnections } from '@/lib/hookdeck'
import { getScenarios } from '@/lib/make'
import { getWorkflows } from '@/lib/n8n'
import sql from '@/lib/db'
import failoverGroups from '@/config/failover.json'
import { SwitchboardControls } from '@/components/switchboard-controls'

export const dynamic = 'force-dynamic'

async function getCronJobs() {
  return sql`
    SELECT jobname, schedule, active
    FROM cron.job
    ORDER BY jobname
  `
}

export default async function SwitchboardPage() {
  const [scenarios, workflows, connections, cronJobs] = await Promise.allSettled([
    getScenarios(),
    getWorkflows(),
    getConnections(),
    getCronJobs(),
  ])

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Switchboard</h1>
        <p className="text-gray-400 text-sm mt-1">Toggle automations and manage failover routing</p>
      </div>

      <SwitchboardControls
        scenarios={scenarios.status === 'fulfilled' ? scenarios.value : []}
        workflows={workflows.status === 'fulfilled' ? workflows.value : []}
        connections={connections.status === 'fulfilled' ? connections.value : []}
        cronJobs={cronJobs.status === 'fulfilled' ? (cronJobs.value as any[]) : []}
        failoverGroups={failoverGroups}
      />
    </div>
  )
}
