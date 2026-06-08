import Sidebar from '@/components/Sidebar'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-950 text-gray-100 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
