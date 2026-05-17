'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import { addProduct, editProduct, deleteProduct, updateHeroImage } from './actions'

type Product = {
  id: string
  name: string
  price: number
  type: string
  imagePath: string | null
}

export function AdminProductManager({ products }: { products: Product[] }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [heroLoading, setHeroLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await addProduct(new FormData(e.currentTarget))
    setLoading(false)
    e.currentTarget.reset()
  }

  const handleHeroUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setHeroLoading(true)
    await updateHeroImage(new FormData(form))
    setHeroLoading(false)
    form.reset()
    alert('Hero image updated successfully!')
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await editProduct(new FormData(e.currentTarget))
    setLoading(false)
    setEditingProduct(null)
  }

  return (
    <div>
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '3rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Update Hero Image</h3>
        <form onSubmit={handleHeroUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Storefront Hero Image</label>
            <input type="file" name="imageFile" accept="image/*" className="input-field" required style={{ padding: '0.5rem' }} />
          </div>
          <button type="submit" disabled={heroLoading} className="btn-primary">
            {heroLoading ? 'Uploading...' : 'Update Hero'}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Products</h2>
      </div>

      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Add New Product</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" name="name" className="input-field" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Price (₹)</label>
            <input type="number" name="price" step="0.01" className="input-field" required />
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
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Image Upload (Optional)</label>
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
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found. Add one above!</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{product.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{product.type}</td>
                  <td style={{ padding: '1rem' }}>₹{product.price.toFixed(2)}</td>
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

      {editingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', position: 'relative' }}>
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
