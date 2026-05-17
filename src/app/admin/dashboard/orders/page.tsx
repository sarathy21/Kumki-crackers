import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true }
      }
    }
  })

  async function updateStatus(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const status = formData.get('status') as string
    if (id && status) {
      await prisma.order.update({
        where: { id },
        data: { status }
      })
      revalidatePath('/admin/dashboard/orders')
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Manage Orders</h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Order ID</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Customer</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Items</th>
              <th style={{ padding: '1rem', color: 'var(--primary-hover)' }}>Total</th>
              <th style={{ padding: '1rem', color: 'var(--primary-hover)' }}>Payment</th>
              <th style={{ padding: '1rem', color: 'var(--primary-hover)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--primary-hover)' }}>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.id.slice(-6)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div><strong>{order.fullName}</strong></div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.phoneNumber}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.city}, {order.district}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                    <ul style={{ listStyle: 'none' }}>
                      {order.items.map(item => (
                        <li key={item.id}>{item.quantity}x {item.product?.name || 'Unknown Item'}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary-hover)' }}>₹{order.totalAmount.toFixed(2)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                    <div>{order.paymentMethod}</div>
                    <div style={{ color: order.paymentStatus === 'COMPLETED' ? '#10B981' : 'var(--text-muted)' }}>{order.paymentStatus}</div>
                    {order.utrNumber && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: '0.25rem' }}>
                        UTR: {order.utrNumber}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      fontSize: '0.8rem',
                      background: order.status === 'DELIVERED' ? 'rgba(0,255,0,0.1)' : 'rgba(255, 215, 0, 0.1)',
                      color: order.status === 'DELIVERED' ? '#0f0' : 'var(--primary)'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <form action={updateStatus} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="hidden" name="id" value={order.id} />
                      <select name="status" defaultValue={order.status} className="input-field" style={{ padding: '0.25rem', width: 'auto' }}>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                      <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.75rem' }}>Update</button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
