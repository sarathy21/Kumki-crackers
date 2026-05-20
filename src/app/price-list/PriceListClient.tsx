'use client'

import { useState } from 'react'
import { Search, Download, FileText, ChevronRight } from 'lucide-react'

type PriceListItem = {
  sno: string
  category: string
  name: string
  pack: string
  price: number
}

export function PriceListClient({ priceListPdf, priceListData }: { priceListPdf: string | null, priceListData: string | null }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const items: PriceListItem[] = priceListData ? JSON.parse(priceListData) : []

  // Extract all categories dynamically
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))]

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pack.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    if (priceListPdf) {
      link.href = priceListPdf;
    } else {
      link.href = '/Kumki-Cracker-Price-List.pdf';
    }
    link.download = 'Kumki-Cracker-Price-List.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="container" style={{ padding: '3rem 1rem 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Official Price List</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Explore our complete selection of premium fireworks and wholesale pricing directly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Controls Block */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '500px' }}>
              <input
                type="text"
                placeholder="Search by name, pack, or category..."
                className="input-field"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPdf}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <Download size={18} /> Download Price List PDF
            </button>
          </div>

          {/* Category Tabs (Horizontally scrollable on mobile) */}
          {categories.length > 1 && (
            <div className="category-slider" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'btn-primary' : 'btn-outline'}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '2rem', flexShrink: 0 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Table */}
      <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ color: 'var(--border-focus)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No Items Found</h3>
            <p>Try searching for a different cracker name or reset filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface-hover)' }}>
                  <th style={{ padding: '1rem', width: '80px', color: 'var(--primary)' }}>S.No</th>
                  <th style={{ padding: '1rem', width: '180px', color: 'var(--primary)' }}>Category</th>
                  <th style={{ padding: '1rem', color: 'var(--primary)' }}>Product Name</th>
                  <th style={{ padding: '1rem', width: '150px', color: 'var(--primary)' }}>Pack Size</th>
                  <th style={{ padding: '1rem', width: '120px', color: 'var(--primary)', textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: index % 2 === 0 ? 'transparent' : 'rgba(193, 145, 0, 0.015)',
                      transition: 'background 0.2s ease'
                    }}
                    className="price-list-row"
                  >
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{item.sno}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <span style={{ background: '#FFEFC0', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{item.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.pack}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--secondary)', textAlign: 'right', fontSize: '1.05rem' }}>
                      ₹{item.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
