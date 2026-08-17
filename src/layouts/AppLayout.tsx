import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
