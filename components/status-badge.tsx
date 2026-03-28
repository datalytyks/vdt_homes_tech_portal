import { clsx } from 'clsx'

type Indicator = 'none' | 'minor' | 'major' | 'critical' | 'unknown'

const styles: Record<Indicator, string> = {
  none:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  minor:    'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  major:    'bg-orange-500/10  text-orange-400  border-orange-500/20',
  critical: 'bg-red-500/10     text-red-400     border-red-500/20',
  unknown:  'bg-gray-500/10    text-gray-400    border-gray-500/20',
}

const labels: Record<Indicator, string> = {
  none:     'Operational',
  minor:    'Minor',
  major:    'Major',
  critical: 'Critical',
  unknown:  'Unknown',
}

const dots: Record<Indicator, string> = {
  none:     'bg-emerald-400',
  minor:    'bg-yellow-400',
  major:    'bg-orange-400',
  critical: 'bg-red-400',
  unknown:  'bg-gray-400',
}

export function StatusBadge({ indicator }: { indicator: string }) {
  const key = (indicator as Indicator) in styles ? (indicator as Indicator) : 'unknown'
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border', styles[key])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', dots[key])} />
      {labels[key]}
    </span>
  )
}
