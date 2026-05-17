'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, CheckCircle, Clock, Truck, X } from 'lucide-react'

type OrderItem = {
  id: string
  productName: string
  quantity: number
  price: number
  discount: number
}

type Order = {
  id: string
  fullName: string
  totalAmount: number
  discountAmount: number
  paymentMethod: string
  paymentStatus: string
  utrNumber: string | null
  status: string
  createdAt: string
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  PENDING: '#C19100',
  CONFIRMED: '#0D9488',
  SHIPPED: '#2563EB',
  DELIVERED: '#16A34A'
}

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPED: Truck,
  DELIVERED: Package
}

function OrdersContent() {
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showPopup, setShowPopup] = useState(searchParams.get('new') === 'true')

  useEffect(() => {
    if (searchParams.get('phone')) {
      fetchOrders(searchParams.get('phone')!)
    }
  }, [])

  const fetchOrders = async (phoneNumber: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?phone=${phoneNumber}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.trim()) fetchOrders(phone.trim())
  }

  return (
    <main className="container" style={{ padding: '2rem 1.5rem', minHeight: '70vh' }}>
      {/* Success Popup */}
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-color)', padding: '2.5rem', borderRadius: '1rem', maxWidth: '450px', width: '100%', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-glow-strong)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(193,145,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={32} color="var(--primary)" />
            </div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Order Initiated!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
              Your order has been successfully placed. We will contact you soon for confirmation.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              You can check your order status on this page anytime. Once verification is done, your status will be updated.
            </p>
            <button onClick={() => setShowPopup(false)} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
              View My Orders
            </button>
          </div>
        </div>
      )}

      <h2 className="glow-text" style={{ marginBottom: '2rem' }}>Track Your Orders</h2>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '500px' }}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          className="input-field"
          required
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Search size={18} /> {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && orders.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No orders found for this phone number.</p>
        </div>
      )}

      {orders.map((order) => {
        const StatusIcon = statusIcons[order.status] || Clock
        return (
          <div key={order.id} className="glass-panel" style={{ borderRadius: '1rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: '2rem', background: `${statusColors[order.status] || '#C19100'}20`, color: statusColors[order.status] || '#C19100', fontWeight: 600, fontSize: '0.85rem' }}>
                <StatusIcon size={16} /> {order.status}
              </div>
            </div>

            {/* Items list */}
            <div style={{ padding: '1rem 1.5rem' }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.productName || '—'}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>×{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'var(--surface-hover)' }}>
              <span className="glow-text" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )
      })}
    </main>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: '2rem 1.5rem', minHeight: '70vh' }}><p>Loading...</p></main>}>
      <OrdersContent />
    </Suspense>
  )
}
