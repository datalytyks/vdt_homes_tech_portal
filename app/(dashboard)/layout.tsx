import { Nav } from '@/components/nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Nav />
      <main className="ml-[220px] p-8">
        {children}
      </main>
    </div>
  )
}
