'use server'

import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function resolveError(id: string) {
  await sql`
    UPDATE technology.d_error_tracking
       SET status      = 'resolved',
           resolved_at = NOW(),
           updated_at  = NOW()
     WHERE id = ${id}::uuid
  `
  revalidatePath('/errors')
  revalidatePath('/')
}

export async function getErrors(source: string, status: string) {
  return sql`
    SELECT
      id, location AS source, errored_item, error_message,
      occurrence_count, created_at AS first_seen, last_seen,
      tracker_item_id, linear_issue_url, status, url, fingerprint
    FROM technology.d_error_tracking
    WHERE
      (${source} = 'all' OR location = ${source})
      AND (${status} = 'all' OR status = ${status})
    ORDER BY last_seen DESC NULLS LAST
    LIMIT 200
  `
}
