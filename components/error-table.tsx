'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { resolveError } from '@/actions/errors'
import { ExternalLink, CheckCircle } from 'lucide-react'
import { useState, useTransition } from 'react'
import { clsx } from 'clsx'

const SOURCES = ['all', 'make', 'n8n', 'status_page', 'retool', 'hookdeck']
const STATUSES = ['open', 'resolved', 'all']

function formatRelative(date: string | null) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hrs   = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 60)  return `${mins}m ago`
  if (hrs  < 24)  return `${hrs}h ago`
  return `${days}d ago`
}

export function ErrorTable({
  errors,
  currentSource,
  currentStatus,
}: {
  errors: any[]
  currentSource: string
  currentStatus: string
}) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`${pathname}?${params}`)
  }

  async function handleResolve(id: string) {
    setResolvingId(id)
    startTransition(() => resolveError(id))
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setFilter('source', s)}
              className={clsx(
                'px-3 py-1 rounded-md text-xs transition-colors capitalize',
                currentSource === s
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {s === 'status_page' ? 'Status Page' : s}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter('status', s)}
              className={clsx(
                'px-3 py-1 rounded-md text-xs transition-colors capitalize',
                currentStatus === s
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Source', 'Item', 'Error', 'Count', 'First seen', 'Last seen', 'Linear', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {errors.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                  No errors found
                </td>
              </tr>
            )}
            {errors.map((err) => (
              <tr key={err.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300 capitalize">
                    {err.source?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 max-w-[150px] truncate">
                  {err.errored_item ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-200 max-w-[240px]">
                  <span className="truncate block" title={err.error_message}>
                    {err.error_message ?? '—'}
                  </span>
                  {err.url && (
                    <a href={err.url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
                      View incident <ExternalLink size={10} />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={clsx(
                    'text-sm font-medium',
                    (err.occurrence_count ?? 1) >= 10 ? 'text-orange-400' : 'text-gray-300'
                  )}>
                    {err.occurrence_count ?? 1}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {formatRelative(err.first_seen)}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {formatRelative(err.last_seen)}
                </td>
                <td className="px-4 py-3">
                  {err.linear_issue_url ? (
                    <a
                      href={err.linear_issue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs hover:underline flex items-center gap-1"
                    >
                      {err.tracker_item_id ?? 'View'} <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {err.status === 'open' && (
                    <button
                      onClick={() => handleResolve(err.id)}
                      disabled={resolvingId === err.id || pending}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} />
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
