'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Package, ShoppingBag, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const navItems = [
    { name: 'Products', path: '/admin/dashboard', icon: Package },
    { name: 'Orders', path: '/admin/dashboard/orders', icon: ShoppingBag },
  ]

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', minHeight: '80vh' }}>
      <aside className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', height: 'fit-content' }}>
        <h3 className="glow-text" style={{ marginBottom: '2rem' }}>Admin Panel</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                background: pathname === item.path ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                color: pathname === item.path ? 'var(--primary)' : 'var(--text-main)',
                transition: 'all 0.2s ease'
              }}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: 'var(--secondary)',
              marginTop: 'auto',
              textAlign: 'left'
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>
      <main className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
        {children}
      </main>
    </div>
  )
}
