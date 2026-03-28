'use client'

import { useState, useTransition } from 'react'
import { clsx } from 'clsx'
import { ExternalLink, Zap, AlertTriangle } from 'lucide-react'
import {
  toggleMakeScenario,
  toggleN8nWorkflow,
  toggleCronJob,
  executeFailover,
} from '@/actions/switchboard'

// Types only — avoids importing server-only lib code into a client component
export interface MakeScenario  { id: number; name: string; isActive: boolean; teamId: number }
export interface N8nWorkflow   { id: string; name: string; active: boolean }
export interface HookdeckConnection {
  id: string; name: string; paused_at: string | null
  source: { id: string; name: string; url: string }
  destination: { id: string; name: string; url: string }
}

interface FailoverConnection {
  id:      string
  label:   string
  primary: boolean
}

interface FailoverGroup {
  name:        string
  description: string
  connections: FailoverConnection[]
}

interface Props {
  scenarios:      MakeScenario[]
  workflows:      N8nWorkflow[]
  connections:    HookdeckConnection[]
  cronJobs:       Array<{ jobname: string; schedule: string; active: boolean }>
  failoverGroups: FailoverGroup[]
}

function Toggle({
  active,
  onChange,
  disabled,
}: {
  active:   boolean
  onChange: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={clsx(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40',
        active ? 'bg-emerald-500' : 'bg-gray-700'
      )}
    >
      <span
        className={clsx(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
          active ? 'translate-x-4.5' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-300 mb-3">{title}</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {children}
      </div>
    </div>
  )
}

export function SwitchboardControls({ scenarios, workflows, connections, cronJobs, failoverGroups }: Props) {
  const [pending, startTransition] = useTransition()
  const [busyKey, setBusyKey]      = useState<string | null>(null)
  const [failoverBusy, setFailoverBusy] = useState<string | null>(null)
  const [failoverConfirm, setFailoverConfirm] = useState<string | null>(null)

  function handleMake(id: number, active: boolean) {
    setBusyKey(`make-${id}`)
    startTransition(async () => {
      await toggleMakeScenario(id, active)
      setBusyKey(null)
    })
  }

  function handleN8n(id: string, active: boolean) {
    setBusyKey(`n8n-${id}`)
    startTransition(async () => {
      await toggleN8nWorkflow(id, active)
      setBusyKey(null)
    })
  }

  function handleCron(jobname: string, active: boolean) {
    setBusyKey(`cron-${jobname}`)
    startTransition(async () => {
      await toggleCronJob(jobname, active)
      setBusyKey(null)
    })
  }

  async function handleFailover(group: FailoverGroup) {
    const primary   = group.connections.find(c => c.primary)
    const secondary = group.connections.find(c => !c.primary)
    if (!primary || !secondary) return

    // Find live paused state from connections
    const livePrimary   = connections.find(c => c.id === primary.id)
    const liveSecondary = connections.find(c => c.id === secondary.id)
    const primaryActive = !livePrimary?.paused_at

    // Swap: pause active, unpause inactive
    const pauseId   = primaryActive ? primary.id   : secondary.id
    const unpauseId = primaryActive ? secondary.id : primary.id

    setFailoverBusy(group.name)
    setFailoverConfirm(null)
    startTransition(async () => {
      await executeFailover(pauseId, unpauseId)
      setFailoverBusy(null)
    })
  }

  return (
    <div className="space-y-8">
      {/* Failover Groups */}
      {failoverGroups.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-300 mb-3">Hookdeck Failover</h2>
          <div className="space-y-3">
            {failoverGroups.map(group => {
              const primary   = group.connections.find(c => c.primary)
              const secondary = group.connections.find(c => !c.primary)
              const livePrimary = connections.find(c => c.id === primary?.id)
              const primaryActive = livePrimary ? !livePrimary.paused_at : null
              const isConfirming = failoverConfirm === group.name
              const isBusy       = failoverBusy   === group.name

              return (
                <div key={group.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{group.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                    </div>
                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <AlertTriangle size={12} /> Confirm swap?
                        </span>
                        <button
                          onClick={() => handleFailover(group)}
                          disabled={isBusy}
                          className="px-3 py-1 rounded-md text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                        >
                          {isBusy ? 'Switching…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setFailoverConfirm(null)}
                          className="px-3 py-1 rounded-md text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setFailoverConfirm(group.name)}
                        disabled={isBusy || pending}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                      >
                        <Zap size={12} />
                        Swap routing
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {group.connections.map(conn => {
                      const live   = connections.find(c => c.id === conn.id)
                      const active = live ? !live.paused_at : null
                      return (
                        <div key={conn.id} className={clsx(
                          'rounded-lg px-3 py-2 border text-xs',
                          active === true  ? 'bg-emerald-500/5 border-emerald-500/20' :
                          active === false ? 'bg-gray-800/50 border-gray-700' :
                          'bg-gray-800/30 border-gray-800'
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 font-medium">{conn.label}</span>
                            <span className={clsx(
                              'text-xs px-1.5 py-0.5 rounded',
                              active === true  ? 'text-emerald-400' :
                              active === false ? 'text-gray-500' : 'text-gray-600'
                            )}>
                              {active === null ? '—' : active ? 'active' : 'paused'}
                            </span>
                          </div>
                          {conn.primary && (
                            <span className="text-gray-600 text-xs">primary</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Make Scenarios */}
      {scenarios.length > 0 && (
        <Section title="Make Scenarios">
          {scenarios.map(s => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Toggle
                  active={s.isActive}
                  onChange={() => handleMake(s.id, s.isActive)}
                  disabled={busyKey === `make-${s.id}` || pending}
                />
                <span className="text-sm text-gray-300">{s.name}</span>
              </div>
              <a
                href={`https://us1.make.com/${process.env.NEXT_PUBLIC_MAKE_ORG_ID ?? ''}/scenarios/${s.id}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-400 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </Section>
      )}

      {/* n8n Workflows */}
      {workflows.length > 0 && (
        <Section title="n8n Workflows">
          {workflows.map(w => (
            <div key={w.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Toggle
                  active={w.active}
                  onChange={() => handleN8n(w.id, w.active)}
                  disabled={busyKey === `n8n-${w.id}` || pending}
                />
                <span className="text-sm text-gray-300">{w.name}</span>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_N8N_INSTANCE_URL ?? ''}/workflow/${w.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-400 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </Section>
      )}

      {/* pg_cron Jobs */}
      {cronJobs.length > 0 && (
        <Section title="Scheduled Jobs (pg_cron)">
          {cronJobs.map(job => (
            <div key={job.jobname} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Toggle
                  active={job.active}
                  onChange={() => handleCron(job.jobname, job.active)}
                  disabled={busyKey === `cron-${job.jobname}` || pending}
                />
                <div>
                  <p className="text-sm text-gray-300">{job.jobname}</p>
                  <p className="text-xs text-gray-600 font-mono mt-0.5">{job.schedule}</p>
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}
