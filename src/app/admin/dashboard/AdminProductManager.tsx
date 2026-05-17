'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit, X, Image, Percent } from 'lucide-react'
import { addProduct, editProduct, deleteProduct, addHeroSlide, deleteHeroSlide, updateGlobalDiscount } from './actions'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  type: string
  imagePath: string | null
}

type Slide = {
  id: string
  imagePath: string
}

type Stats = {
  totalOrders: number
  monthlyRevenue: number
  totalProducts: number
  pendingOrders: number
}

export function AdminProductManager({ products, heroSlides, stats, globalDiscount }: { products: Product[], heroSlides: Slide[], stats: Stats, globalDiscount: number }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [heroLoading, setHeroLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    await addProduct(new FormData(form))
    setLoading(false)
    form.reset()
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    await editProduct(new FormData(form))
    setLoading(false)
    setEditingProduct(null)
  }

  const handleHeroUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setHeroLoading(true)
    await addHeroSlide(new FormData(form))
    setHeroLoading(false)
    form.reset()
  }

  return (
    <div>
      {/* Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Monthly Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalOrders}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Monthly Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{stats.monthlyRevenue.toFixed(0)}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Products</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalProducts}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pending Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.pendingOrders}</div>
        </div>
      </div>

      {/* Hero Slider Manager */}
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '3rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Hero Slider Images</h3>
        <form onSubmit={handleHeroUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Add Slide Image</label>
            <input type="file" name="imageFile" accept="image/*" className="input-field" required style={{ padding: '0.5rem' }} />
          </div>
          <button type="submit" disabled={heroLoading} className="btn-primary">
            {heroLoading ? 'Uploading...' : 'Add Slide'}
          </button>
        </form>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {heroSlides.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No slides added yet.</p>}
          {heroSlides.map((slide) => (
            <div key={slide.id} style={{ position: 'relative', width: '150px', height: '100px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={slide.imagePath} alt="Slide" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <form action={deleteHeroSlide} style={{ position: 'absolute', top: '4px', right: '4px' }}>
                <input type="hidden" name="id" value={slide.id} />
                <button type="submit" style={{ background: 'rgba(212,69,11,0.9)', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <X size={14} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Global Discount Setting */}
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '3rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Percent size={20} /> Global Discount
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Set a site-wide discount percentage that applies to <strong>all products</strong>. Set to 0 to disable.
        </p>
        <form action={updateGlobalDiscount} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div style={{ flex: '0 0 200px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Discount %</label>
            <input type="number" name="discount" min="0" max="100" defaultValue={globalDiscount} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary">
            {globalDiscount > 0 ? 'Update Discount' : 'Set Discount'}
          </button>
          {globalDiscount > 0 && (
            <span style={{ background: '#D4450B', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Currently: {globalDiscount}% OFF on all products
            </span>
          )}
        </form>
      </div>

      {/* Manage Products */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Products</h2>
      </div>

      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Add New Product</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" name="name" className="input-field" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Price (₹)</label>
            <input type="number" name="price" step="0.01" className="input-field" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Stock Qty</label>
            <input type="number" name="stock" min="0" defaultValue="0" className="input-field" required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Type/Category</label>
            <select name="type" className="input-field" required style={{ background: 'var(--surface-hover)' }}>
              <option value="Sound Crackers">Sound Crackers</option>
              <option value="Sparklers">Sparklers</option>
              <option value="Ground Chakkars">Ground Chakkars</option>
              <option value="Flower Pot">Flower Pot</option>
              <option value="Kids Noveltiles">Kids Noveltiles</option>
              <option value="Fancy">Fancy</option>
              <option value="Sky Shot">Sky Shot</option>
              <option value="Fancy Shower">Fancy Shower</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Image</label>
            <input type="file" name="imageFile" accept="image/*" className="input-field" style={{ padding: '0.5rem' }} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Type</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Price</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Stock</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{product.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{product.type}</td>
                  <td style={{ padding: '1rem' }}>₹{product.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    {product.stock === 0 ? (
                      <span style={{ background: '#DC2626', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>Out of Stock</span>
                    ) : product.stock <= 20 ? (
                      <span style={{ background: '#F59E0B', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>{product.stock} (Low)</span>
                    ) : (
                      <span>{product.stock}</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setEditingProduct(product)} style={{ background: 'transparent', color: 'var(--primary)' }}>
                      <Edit size={18} />
                    </button>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" style={{ background: 'transparent', color: 'var(--secondary)' }}>
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-color)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', position: 'relative', border: '1px solid var(--border)' }}>
            <button onClick={() => setEditingProduct(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Edit Product</h3>
            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="hidden" name="id" value={editingProduct.id} />
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Name</label>
                <input type="text" name="name" defaultValue={editingProduct.name} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Price (₹)</label>
                <input type="number" name="price" step="0.01" defaultValue={editingProduct.price} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Stock Qty</label>
                <input type="number" name="stock" min="0" defaultValue={editingProduct.stock} className="input-field" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Type/Category</label>
                <select name="type" defaultValue={editingProduct.type} className="input-field" required>
                  <option value="Sound Crackers">Sound Crackers</option>
                  <option value="Sparklers">Sparklers</option>
                  <option value="Ground Chakkars">Ground Chakkars</option>
                  <option value="Flower Pot">Flower Pot</option>
                  <option value="Kids Noveltiles">Kids Noveltiles</option>
                  <option value="Fancy">Fancy</option>
                  <option value="Sky Shot">Sky Shot</option>
                  <option value="Fancy Shower">Fancy Shower</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>New Image (Optional)</label>
                <input type="file" name="imageFile" accept="image/*" className="input-field" style={{ padding: '0.5rem' }} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
