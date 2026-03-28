import { StatusBadge } from '@/components/status-badge'
import sql from '@/lib/db'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

const VENDORS = [
  { name: 'Make',           statusUrl: 'https://status.make.com/api/v2/status.json',             pageUrl: 'https://status.make.com' },
  { name: 'Supabase',       statusUrl: 'https://status.supabase.com/api/v2/status.json',         pageUrl: 'https://status.supabase.com' },
  { name: 'Hookdeck',       statusUrl: 'https://status.hookdeck.com/api/v2/status.json',         pageUrl: 'https://status.hookdeck.com' },
  { name: 'Retool',         statusUrl: 'https://status.retool.com/api/v2/status.json',           pageUrl: 'https://status.retool.com' },
  { name: 'Linear',         statusUrl: 'https://linearstatus.com/api/v2/status.json',            pageUrl: 'https://linearstatus.com' },
  { name: 'DigitalOcean',   statusUrl: 'https://status.digitalocean.com/api/v2/status.json',     pageUrl: 'https://status.digitalocean.com' },
  { name: 'Postman',        statusUrl: 'https://status.postman.com/api/v2/status.json',          pageUrl: 'https://status.postman.com' },
  { name: 'Follow Up Boss', statusUrl: 'https://followupboss.statuspage.io/api/v2/status.json',  pageUrl: 'https://followupboss.statuspage.io' },
]

async function getVendorStatus(statusUrl: string): Promise<{ indicator: string; description: string }> {
  try {
    const res  = await fetch(statusUrl, { next: { revalidate: 60 } })
    const data = await res.json()
    return {
      indicator:   data?.status?.indicator   ?? 'unknown',
      description: data?.status?.description ?? '',
    }
  } catch {
    return { indicator: 'unknown', description: '' }
  }
}

async function getRecentStatusEvents() {
  return sql`
    SELECT
      id, errored_item AS vendor, error_message, url,
      created_at AS first_seen, last_seen, status
    FROM technology.d_error_tracking
    WHERE location = 'status_page'
    ORDER BY last_seen DESC NULLS LAST
    LIMIT 50
  `
}

function formatRelative(date: string | null) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hrs   = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 60) return `${mins}m ago`
  if (hrs  < 24) return `${hrs}h ago`
  return `${days}d ago`
}

export default async function StatusPage() {
  const [vendorStatuses, incidents] = await Promise.all([
    Promise.all(VENDORS.map(v => getVendorStatus(v.statusUrl))),
    getRecentStatusEvents(),
  ])

  const degraded = vendorStatuses.filter(s => s.indicator !== 'none' && s.indicator !== 'unknown').length

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-white">System Status</h1>
        <p className="text-gray-400 text-sm mt-1">
          Live vendor health{degraded > 0 ? ` — ${degraded} degraded` : ' — all systems operational'}
        </p>
      </div>

      {/* Vendor grid */}
      <div className="grid grid-cols-2 gap-3">
        {VENDORS.map((vendor, i) => {
          const { indicator, description } = vendorStatuses[i]
          return (
            <a
              key={vendor.name}
              href={vendor.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-colors group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-200">{vendor.name}</span>
                  <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>
                {description && (
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                )}
              </div>
              <StatusBadge indicator={indicator} />
            </a>
          )
        })}
      </div>

      {/* Recent incidents from status_page source */}
      <div>
        <h2 className="text-sm font-medium text-gray-300 mb-3">Recent Incidents</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Vendor', 'Incident', 'First seen', 'Last seen', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No incidents recorded
                  </td>
                </tr>
              )}
              {incidents.map((inc: any) => (
                <tr key={inc.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">
                      {inc.vendor ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-200 max-w-[300px]">
                    <span className="truncate block" title={inc.error_message}>
                      {inc.error_message ?? '—'}
                    </span>
                    {inc.url && (
                      <a href={inc.url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
                        View incident <ExternalLink size={10} />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatRelative(inc.first_seen)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatRelative(inc.last_seen)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                      inc.status === 'open'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
