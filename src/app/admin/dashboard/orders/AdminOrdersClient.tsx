'use client'

import { useState } from 'react'
import { Download, FileText, XCircle } from 'lucide-react'
import { updateOrderStatus, cancelOrder } from '../actions'

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
  phoneNumber: string
  city: string
  district: string
  areaName: string
  pinCode: string
  totalAmount: number
  discountAmount: number
  paymentMethod: string
  paymentStatus: string
  utrNumber: string | null
  cancelReason: string | null
  status: string
  createdAt: string
  items: OrderItem[]
}

export function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'>('PENDING')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED')
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'SHIPPED')
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED')

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    try {
      const formData = new FormData()
      formData.append('id', orderId)
      formData.append('status', status)
      await updateOrderStatus(formData)
    } catch (err) {
      alert("Failed to update status: " + err)
    } finally {
      setUpdatingId(null)
    }
  }

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'PENDING': return pendingOrders
      case 'CONFIRMED': return confirmedOrders
      case 'DELIVERED': return deliveredOrders
      case 'CANCELLED': return cancelledOrders
      default: return []
    }
  }

  const currentTabOrders = getFilteredOrders()

  const downloadBill = async (order: Order) => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('KUMKI CRACKERS', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Wholesale & Retail Sale', pageWidth / 2, 27, { align: 'center' })
    doc.text('M. Ravi Krishna D.A.A.', pageWidth / 2, 33, { align: 'center' })
    doc.text('Rathna Nagar, Naranapuram Road, Sivakasi - 626 189', pageWidth / 2, 39, { align: 'center' })
    doc.text('Call: 88382 81866', pageWidth / 2, 45, { align: 'center' })
    
    // Line
    doc.setDrawColor(193, 145, 0)
    doc.setLineWidth(0.5)
    doc.line(15, 50, pageWidth - 15, 50)
    
    // Invoice details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', pageWidth / 2, 58, { align: 'center' })
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.text(`Order ID: #${order.id.slice(-6).toUpperCase()}`, 15, 66)
    doc.text(`Date: ${orderDate}`, pageWidth - 15, 66, { align: 'right' })
    
    // Customer details
    doc.text(`Customer: ${order.fullName}`, 15, 74)
    doc.text(`Phone: ${order.phoneNumber}`, 15, 80)
    doc.text(`Address: ${order.areaName}, ${order.city}, ${order.district} - ${order.pinCode}`, 15, 86)
    
    // Line
    doc.line(15, 91, pageWidth - 15, 91)
    
    // Table header
    let y = 99
    doc.setFont('helvetica', 'bold')
    doc.text('S.No', 15, y)
    doc.text('Item Name', 30, y)
    doc.text('Qty', 120, y, { align: 'center' })
    doc.text('Price', 155, y, { align: 'right' })
    doc.text('Total', pageWidth - 15, y, { align: 'right' })
    
    doc.line(15, y + 3, pageWidth - 15, y + 3)
    y += 10
    
    // Table rows
    doc.setFont('helvetica', 'normal')
    order.items.forEach((item, idx) => {
      // Check for page overflow
      if (y > 270) {
        doc.addPage()
        y = 20
        // Redraw table headers on new page
        doc.setFont('helvetica', 'bold')
        doc.text('S.No', 15, y)
        doc.text('Item Name', 30, y)
        doc.text('Qty', 120, y, { align: 'center' })
        doc.text('Price', 155, y, { align: 'right' })
        doc.text('Total', pageWidth - 15, y, { align: 'right' })
        doc.line(15, y + 3, pageWidth - 15, y + 3)
        y += 10
        doc.setFont('helvetica', 'normal')
      }

      const total = item.price * item.quantity
      // Handle potential long product names to avoid wrapping overflow manually
      const name = item.productName || '—'
      const truncatedName = name.length > 45 ? name.substring(0, 42) + '...' : name

      doc.text(`${idx + 1}`, 15, y)
      doc.text(truncatedName, 30, y)
      doc.text(`${item.quantity}`, 120, y, { align: 'center' })
      doc.text(`Rs. ${item.price.toFixed(2)}`, 155, y, { align: 'right' })
      doc.text(`Rs. ${total.toFixed(2)}`, pageWidth - 15, y, { align: 'right' })
      y += 8
    })
    
    // Check if we need a new page for totals and footer
    if (y > 240) {
      doc.addPage()
      y = 20
    }

    // Line
    doc.line(15, y, pageWidth - 15, y)
    y += 8
    
    // Total
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`Grand Total: Rs. ${order.totalAmount.toFixed(2)}`, pageWidth - 15, y, { align: 'right' })
    y += 10
    
    // Payment info
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Payment: ${order.paymentMethod}`, 15, y)
    if (order.utrNumber) {
      doc.text(`Ref ID: ${order.utrNumber}`, 15, y + 6)
      y += 6
    }
    
    // Footer
    y += 20
    if (y > 275) {
      doc.addPage()
      y = 20
    }
    doc.setDrawColor(193, 145, 0)
    doc.line(15, y, pageWidth - 15, y)
    y += 8
    doc.setFontSize(8)
    doc.text('Thank you for shopping with Kumki Crackers!', pageWidth / 2, y, { align: 'center' })
    
    doc.save(`Kumki_Bill_${order.id.slice(-6).toUpperCase()}.pdf`)
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Orders Management</h2>

      {/* Modern Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { key: 'PENDING', label: 'Pending Orders', count: pendingOrders.length, color: 'var(--secondary)' },
          { key: 'CONFIRMED', label: 'Confirmed Orders', count: confirmedOrders.length, color: 'var(--primary)' },
          { key: 'DELIVERED', label: 'Delivered / Shipped', count: deliveredOrders.length, color: '#10B981' },
          { key: 'CANCELLED', label: 'Cancelled Orders', count: cancelledOrders.length, color: '#EF4444' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              borderRadius: '0.5rem 0.5rem 0 0',
              background: activeTab === tab.key ? 'var(--surface-hover)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-main)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? tab.color : 'rgba(122, 101, 48, 0.15)',
              color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      
      {currentTabOrders.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          No orders in this section.
        </div>
      ) : (
        currentTabOrders.map(order => (
          <div key={order.id} style={{ background: 'var(--surface)', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-glow)' }}>
            {/* Order header */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
              <div>
                <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '1rem', fontSize: '0.85rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {updatingId === order.id ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updating...</span>
                ) : (
                  <>
                    {/* Status Action Buttons */}
                    {order.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'CONFIRMED')} 
                          className="btn-primary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: '#10B981', boxShadow: 'none' }}
                        >
                          Confirm Order
                        </button>
                        <button 
                          onClick={() => setCancellingId(order.id)} 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: '#EF4444', color: '#fff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'DELIVERED')} 
                          className="btn-primary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: '#3B82F6', boxShadow: 'none' }}
                        >
                          Mark Delivered
                        </button>
                        <button 
                          onClick={() => setCancellingId(order.id)} 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: '#EF4444', color: '#fff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}

                    {(order.status === 'DELIVERED' || order.status === 'SHIPPED') && (
                      <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: '0.5rem', fontWeight: 'bold' }}>
                        ✓ DELIVERED
                      </span>
                    )}

                    {order.status === 'CANCELLED' && (
                      <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderRadius: '0.5rem', fontWeight: 'bold' }}>
                        ✕ CANCELLED
                      </span>
                    )}
                  </>
                )}

                <button onClick={() => downloadBill(order)} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Download size={14} /> Bill
                </button>
              </div>
            </div>
            
            {/* Customer info */}
            <div style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div><strong>Name:</strong> {order.fullName}</div>
              <div><strong>Phone:</strong> {order.phoneNumber}</div>
              <div><strong>Address:</strong> {order.areaName}, {order.city}, {order.district} - {order.pinCode}</div>
              <div>
                <strong>Payment:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: order.paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--text-main)' }}>{order.paymentMethod}</span> ({order.paymentStatus})
                {order.utrNumber && <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.25rem', background: 'var(--surface-hover)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', wordBreak: 'break-all' }}>UTR: {order.utrNumber}</span>}
              </div>
            </div>
            
            {/* Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.6rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Item</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty</th>
                  <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price</th>
                  <th style={{ padding: '0.6rem 1.5rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 1.5rem' }}>{item.productName || '—'}</td>
                    <td style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                    <td style={{ padding: '0.6rem 1.5rem', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ padding: '1rem 1.5rem', textAlign: 'right', background: 'var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {order.cancelReason && (
                  <div style={{ textAlign: 'left', fontSize: '0.85rem', color: '#EF4444' }}>
                    <strong>Cancel Reason:</strong> {order.cancelReason}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>Total: ₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        ))
      )}

      {/* Cancel Reason Modal */}
      {cancellingId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-color)', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#EF4444' }}>Cancel Order</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>Please provide a reason for cancellation:</p>
            <form action={async (formData: FormData) => {
              await cancelOrder(formData)
              setCancellingId(null)
              setCancelReason('')
            }}>
              <input type="hidden" name="id" value={cancellingId} />
              <textarea
                name="reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="e.g. Customer requested cancellation, Out of stock..."
                required
                style={{ resize: 'vertical', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setCancellingId(null); setCancelReason('') }} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
                  Go Back
                </button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#EF4444', color: '#fff', borderRadius: '0.5rem', fontWeight: 600 }}>
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
