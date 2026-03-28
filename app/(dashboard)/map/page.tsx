import { getConnections } from '@/lib/hookdeck'
import { HookdeckMap } from '@/components/hookdeck-map'
import { Monitor } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MapPage() {
  const connections = await getConnections()
  const paused      = connections.filter(c => c.paused_at).length

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Connection Map</h1>
        <p className="text-gray-400 text-sm mt-1">
          {connections.length} connection{connections.length !== 1 ? 's' : ''}
          {paused > 0 ? ` — ${paused} paused` : ''}
        </p>
      </div>

      {/* Mobile gate */}
      <div className="md:hidden flex flex-col items-center justify-center py-20 text-center gap-4">
        <Monitor size={40} className="text-gray-600" />
        <p className="text-gray-300 font-medium">Best viewed on a desktop browser</p>
        <p className="text-gray-500 text-sm max-w-xs">
          The connection map requires a larger screen to display properly. Open this page on a computer for the full view.
        </p>
      </div>

      {/* Desktop map */}
      <div className="hidden md:block">
        <div className="flex gap-4 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-indigo-500" />
            Active
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-gray-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#6b7280 0,#6b7280 4px,transparent 4px,transparent 8px)' }} />
            Paused
          </div>
        </div>
        <HookdeckMap connections={connections} />
      </div>
    </div>
  )
}
