'use server'

import { activateScenario, deactivateScenario } from '@/lib/make'
import { activateWorkflow, deactivateWorkflow } from '@/lib/n8n'
import { pauseConnection, unpauseConnection } from '@/lib/hookdeck'
import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function toggleMakeScenario(id: number, currentlyActive: boolean) {
  if (currentlyActive) {
    await deactivateScenario(id)
  } else {
    await activateScenario(id)
  }
  revalidatePath('/switchboard')
}

export async function toggleN8nWorkflow(id: string, currentlyActive: boolean) {
  if (currentlyActive) {
    await deactivateWorkflow(id)
  } else {
    await activateWorkflow(id)
  }
  revalidatePath('/switchboard')
}

export async function toggleCronJob(jobname: string, currentlyActive: boolean) {
  if (currentlyActive) {
    await sql`SELECT cron.unschedule(${jobname})`
  } else {
    // Re-schedule using stored definition — read from cron.job first
    const [job] = await sql`SELECT schedule, command FROM cron.job WHERE jobname = ${jobname}`
    if (job) {
      await sql`SELECT cron.schedule(${jobname}, ${job.schedule}, ${job.command})`
    }
  }
  revalidatePath('/switchboard')
}

// Failover: pause one connection and unpause another atomically
export async function executeFailover(pauseId: string, unpauseId: string) {
  await Promise.all([
    pauseConnection(pauseId),
    unpauseConnection(unpauseId),
  ])
  revalidatePath('/switchboard')
}
