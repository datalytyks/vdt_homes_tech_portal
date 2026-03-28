import sql from '@/lib/db'
import { StatusBadge } from '@/components/status-badge'
import { AlertCircle, CheckCircle2, Zap, Clock } from 'lucide-react'

const VENDORS = [
  { name: 'Make',         url: 'https://status.make.com',             statusUrl: 'https://status.make.com/api/v2/status.json',             pageUrl: 'https://status.make.com' },
  { name: 'Supabase',     url: 'https://status.supabase.com',         statusUrl: 'https://status.supabase.com/api/v2/status.json',         pageUrl: 'https://status.supabase.com' },
  { name: 'Hookdeck',     url: 'https://status.hookdeck.com',         statusUrl: 'https://status.hookdeck.com/api/v2/status.json',         pageUrl: 'https://status.hookdeck.com' },
  { name: 'Retool',       url: 'https://status.retool.com',           statusUrl: 'https://status.retool.com/api/v2/status.json',           pageUrl: 'https://status.retool.com' },
  { name: 'Linear',       url: 'https://linearstatus.com',            statusUrl: 'https://linearstatus.com/api/v2/status.json',            pageUrl: 'https://linearstatus.com' },
  { name: 'DigitalOcean', url: 'https://status.digitalocean.com',     statusUrl: 'https://status.digitalocean.com/api/v2/status.json',     pageUrl: 'https://status.digitalocean.com' },
  { name: 'Postman',      url: 'https://status.postman.com',          statusUrl: 'https://status.postman.com/api/v2/status.json',          pageUrl: 'https://status.postman.com' },
  { name: 'Follow Up Boss', url: 'https://followupboss.statuspage.io', statusUrl: 'https://followupboss.statuspage.io/api/v2/status.json', pageUrl: 'https://followupboss.statuspage.io' },
]

async function getVendorStatus(statusUrl: string) {
  try {
    const res = await fetch(statusUrl, { next: { revalidate: 60 } })
    const data = await res.json()
    return data?.status?.indicator ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

async function getErrorStats() {
  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'open')::int                                              AS open_count,
      COUNT(*) FILTER (WHERE status = 'open'
                        AND created_at >= NOW() - INTERVAL '1 hour')::int                      AS new_last_hour,
      COUNT(*) FILTER (WHERE status = 'open'
                        AND linear_issue_id IS NOT NULL)::int                                   AS with_linear,
      COUNT(*) FILTER (WHERE status = 'open'
                        AND occurrence_count >= 10)::int                                        AS spikes
    FROM technology.d_error_tracking
  `
  return stats
}

export default async function OverviewPage() {
  const [stats, vendorStatuses] = await Promise.all([
    getErrorStats(),
    Promise.all(VENDORS.map(v => getVendorStatus(v.statusUrl))),
  ])

  const degraded = vendorStatuses.filter(s => s !== 'none' && s !== 'unknown').length

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Live snapshot of errors and vendor health</p>
      </div>

      {/* Error stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open Errors',   value: stats.open_count,   icon: AlertCircle,  color: 'text-red-400' },
          { label: 'New (1 hr)',    value: stats.new_last_hour, icon: Clock,        color: 'text-yellow-400' },
          { label: 'Spike Events',  value: stats.spikes,        icon: Zap,          color: 'text-orange-400' },
          { label: 'Triaged',       value: stats.with_linear,   icon: CheckCircle2, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <span className="text-3xl font-bold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Vendor status strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-300">Vendor Health</h2>
          {degraded > 0 && (
            <span className="text-xs text-yellow-400">{degraded} degraded</span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {VENDORS.map((vendor, i) => (
            <a
              key={vendor.name}
              href={vendor.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center justify-between hover:border-gray-700 transition-colors"
            >
              <span className="text-sm text-gray-300">{vendor.name}</span>
              <StatusBadge indicator={vendorStatuses[i]} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
