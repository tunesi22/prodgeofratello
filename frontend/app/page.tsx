import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { WaitlistPage } from '@/components/landing/WaitlistPage'

export default async function RootPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('geo_token')) redirect('/brands')
  return <WaitlistPage />
}
