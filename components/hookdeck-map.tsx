'use client'

import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { HookdeckConnection } from '@/lib/hookdeck'

interface Props {
  connections: HookdeckConnection[]
}

export function HookdeckMap({ connections }: Props) {
  // Deduplicate sources and destinations
  const sourceMap   = new Map<string, HookdeckConnection['source']>()
  const destMap     = new Map<string, HookdeckConnection['destination']>()

  for (const conn of connections) {
    sourceMap.set(conn.source.id, conn.source)
    destMap.set(conn.destination.id, conn.destination)
  }

  const sources = Array.from(sourceMap.values())
  const dests   = Array.from(destMap.values())

  const sourceSpacing = 120
  const destSpacing   = 120
  const sourceOffset  = (sources.length - 1) * sourceSpacing / 2
  const destOffset    = (dests.length - 1)   * destSpacing   / 2

  const nodes: Node[] = [
    ...sources.map((s, i) => ({
      id:       `src-${s.id}`,
      position: { x: 0, y: i * sourceSpacing - sourceOffset + 300 },
      data:     { label: s.name },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: '#1f2937',
        border:     '1px solid #374151',
        borderRadius: 8,
        color:      '#d1d5db',
        fontSize:   12,
        padding:    '6px 12px',
        width:      160,
      },
    })),
    ...dests.map((d, i) => ({
      id:       `dst-${d.id}`,
      position: { x: 440, y: i * destSpacing - destOffset + 300 },
      data:     { label: d.name },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: '#1f2937',
        border:     '1px solid #374151',
        borderRadius: 8,
        color:      '#d1d5db',
        fontSize:   12,
        padding:    '6px 12px',
        width:      160,
      },
    })),
  ]

  const edges: Edge[] = connections.map(conn => ({
    id:     conn.id,
    source: `src-${conn.source.id}`,
    target: `dst-${conn.destination.id}`,
    label:  conn.paused_at ? 'paused' : conn.name,
    animated: !conn.paused_at,
    markerEnd: { type: MarkerType.ArrowClosed, color: conn.paused_at ? '#6b7280' : '#6366f1' },
    style:  {
      stroke:      conn.paused_at ? '#6b7280' : '#6366f1',
      strokeWidth: 1.5,
      strokeDasharray: conn.paused_at ? '4 4' : undefined,
    },
    labelStyle:       { fill: '#9ca3af', fontSize: 10 },
    labelBgStyle:     { fill: '#111827' },
    labelBgPadding:   [4, 2] as [number, number],
    labelBgBorderRadius: 4,
  }))

  return (
    <div className="h-[600px] bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1f2937" gap={20} />
        <Controls showInteractive={false} className="[&>button]:bg-gray-800 [&>button]:border-gray-700 [&>button]:text-gray-300" />
      </ReactFlow>
    </div>
  )
}
