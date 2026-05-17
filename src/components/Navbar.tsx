'use client'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const getItemCount = useCartStore((state) => state.getItemCount)
  const cartCount = getItemCount()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="navbar glass-panel">
      <div className="container nav-content">
        <Link href="/" className="logo glow-text">
          <h2>Kumki Crackers</h2>
        </Link>
        
        <nav className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/products" onClick={() => setIsOpen(false)}>Products</Link>
          <Link href="/price-list" onClick={() => setIsOpen(false)}>Price List</Link>
          <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
        </nav>
        
        <div className="nav-actions">
          <Link href="/cart" className="cart-btn btn-outline">
            <ShoppingCart size={20} />
            <span className="cart-count">{mounted ? cartCount : 0}</span>
          </Link>
          <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}
