'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { Trash2, Plus, Minus, ArrowRight, Wallet, Truck, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { triggerSkyShot } from '@/utils/confetti'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [showQRModal, setShowQRModal] = useState(false)
  const [utr, setUtr] = useState('')
  const [orderDataState, setOrderDataState] = useState<any>(null)
  const [phoneForLookup, setPhoneForLookup] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const placeDatabaseOrder = async (finalOrderData: any) => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrderData)
      })

      if (res.ok) {
        const phone = finalOrderData.phoneNumber
        clearCart()
        triggerSkyShot()
        setShowQRModal(false)
        router.push(`/orders?phone=${phone}&new=true`)
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to place order. Please try again.')
      }
    } catch (err) {
      alert('An error occurred while placing the order.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phoneNumber') as string
    setPhoneForLookup(phone)

    const orderData = {
      fullName: formData.get('fullName') as string,
      city: formData.get('city') as string,
      district: formData.get('district') as string,
      pinCode: formData.get('pinCode') as string,
      phoneNumber: phone,
      areaName: formData.get('areaName') as string,
      totalAmount: getTotal(),
      discountAmount: 0,
      paymentMethod,
      paymentStatus: 'PENDING',
      utrNumber: null,
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    }

    if (paymentMethod === 'COD') {
      await placeDatabaseOrder(orderData)
    } else if (paymentMethod === 'UPI') {
      setOrderDataState(orderData)
      setShowQRModal(true)
    }
  }

  const handleQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!utr || utr.trim() === '') {
      alert('Please enter your transaction reference number.')
      return
    }
    const finalOrder = {
      ...orderDataState,
      paymentStatus: 'PENDING',
      utrNumber: utr
    }
    await placeDatabaseOrder(finalOrder)
  }

  if (!mounted) return null

  const upiId = 'ravikrishnan1990m@oksbi'
  const payeeName = encodeURIComponent('sarathy s')
  const amount = getTotal().toFixed(2)
  const upiLink = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR`

  return (
    <main className={`container ${items.length > 0 ? 'cart-grid' : ''}`} style={{ padding: '2rem 0', minHeight: '70vh' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 className="glow-text">Your Cart</h2>
        
        {items.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Your cart is empty.</p>
            <button onClick={() => router.push('/')} className="btn-primary">Browse Products</button>
          </div>
        ) : (
          <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image" style={{ background: 'var(--surface-hover)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.imagePath ? <img src={item.imagePath} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>No img</span>}
                </div>
                <div className="cart-item-details">
                  <h4 style={{ marginBottom: '0.25rem' }}>{item.name}</h4>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.type}</div>
                  <div className="glow-text" style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>₹{item.price.toFixed(2)}</div>
                </div>
                <div className="cart-item-actions">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: '2rem' }}>
                    <button type="button" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-main)' }}><Minus size={16} /></button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-main)' }}><Plus size={16} /></button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} style={{ padding: '0.5rem', background: 'rgba(212,69,11,0.1)', color: 'var(--secondary)', borderRadius: '0.5rem' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)' }}>
              <span style={{ fontSize: '1.2rem' }}>Total Amount</span>
              <span className="glow-text" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{getTotal().toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', height: 'fit-content' }}>
          <h3 className="glow-text" style={{ marginBottom: '1.5rem' }}>Checkout Details</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" name="fullName" className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Phone Number</label>
              <input type="tel" name="phoneNumber" className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>City / Village</label>
              <input type="text" name="city" className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>District Name</label>
              <input type="text" name="district" className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Area Name</label>
              <input type="text" name="areaName" className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pin Code</label>
              <input type="text" name="pinCode" className="input-field" required />
            </div>

            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 'bold' }}>Payment Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer', background: paymentMethod === 'COD' ? 'var(--surface-hover)' : 'transparent' }}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                  <Truck size={18} /> Cash on Delivery
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', cursor: 'pointer', background: paymentMethod === 'UPI' ? 'var(--surface-hover)' : 'transparent' }}>
                  <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                  <Wallet size={18} /> UPI / QR Code
                </label>
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '1rem' }}>
              {loading ? 'Processing...' : paymentMethod === 'UPI' ? 'Proceed to Pay' : 'Place Order'} <ArrowRight size={20} />
            </button>
          </form>
        </div>
      )}

      {/* QR Code Payment Modal */}
      {showQRModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="glass-panel" style={{ background: 'var(--bg-color)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setShowQRModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent' }}>
              <X size={24} />
            </button>

            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--primary)' }}>Scan & Pay</h3>
            
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', border: '2px solid var(--border)' }}>
              <QRCodeSVG value={upiLink} size={200} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Amount: <strong className="glow-text">₹{amount}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Scan using GPay, PhonePe, Paytm, or any UPI app</p>
              <a href={upiLink} className="btn-outline" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem' }}>
                Or Click Here to Pay via UPI App
              </a>
            </div>

            <form onSubmit={handleQRSubmit} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Enter Transaction Reference Number</label>
                <input type="text" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. 123456789012 or Txn ID" className="input-field" required />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
                * Please ensure you enter the correct reference number so we can confirm your order.
              </p>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Verifying...' : 'Verify Payment & Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
