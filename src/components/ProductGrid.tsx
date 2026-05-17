'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { triggerSkyShot } from '@/utils/confetti'

type Product = {
  id: string
  name: string
  price: number
  type: string
  imagePath: string | null
}

const CATEGORIES = [
  'All',
  'Sound Crackers',
  'Sparklers',
  'Ground Chakkars',
  'Flower Pot',
  'Kids Noveltiles',
  'Fancy',
  'Sky Shot',
  'Fancy Shower'
]

export function ProductGrid({ initialProducts }: { initialProducts: Product[] }) {
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const addItem = useCartStore(state => state.addItem)

  const filteredProducts = initialProducts.filter(p => {
    const matchesFilter = filter === 'All' || p.type === filter
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [selectedProduct])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          className="input-field"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: '500px', margin: '0 auto' }}
        />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={filter === cat ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '2rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        layout 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '2rem' 
        }}
      >
        <AnimatePresence>
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              variants={itemVariant}
              layoutId={`card-${product.id}`}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5, boxShadow: 'var(--shadow-glow)' }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedProduct(product)}
              className="glass-panel"
              style={{ 
                padding: '1.5rem', 
                borderRadius: '1rem', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer'
              }}
            >
              <div style={{ height: '150px', background: 'var(--surface-hover)', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {product.imagePath ? (
                  <img src={product.imagePath} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>No Image</span>
                )}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{product.type}</p>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="glow-text" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{product.price.toFixed(2)}</span>
                <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>View Details &rarr;</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Modal overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            padding: '1rem'
          }}>
            <motion.div
              layoutId={`card-${selectedProduct.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                background: 'var(--surface)',
                borderRadius: '1.5rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                boxShadow: 'var(--shadow-glow-strong)'
              }}
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
              
              <div style={{ height: '250px', background: 'var(--surface-hover)', borderRadius: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {selectedProduct.imagePath ? (
                  <img src={selectedProduct.imagePath} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>No Image Available</span>
                )}
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{selectedProduct.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>Category: {selectedProduct.type}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Price</div>
                  <div className="glow-text" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{selectedProduct.price.toFixed(2)}</div>
                </div>
                
                <button 
                  onClick={() => {
                    addItem({ ...selectedProduct, quantity: 1 })
                    setSelectedProduct(null)
                    triggerSkyShot()
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              </div>
            </motion.div>
            <div 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} 
              onClick={() => setSelectedProduct(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          No products found matching your criteria.
        </div>
      )}
    </div>
  )
}
