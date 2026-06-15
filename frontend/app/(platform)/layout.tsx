import { AppShell } from '@/components/dashboard/AppShell'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
