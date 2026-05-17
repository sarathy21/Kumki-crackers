export default function PriceListPage() {
  return (
    <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Price List</h1>
      
      <div className="glass-panel" style={{ padding: '4rem 2rem', borderRadius: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Download our Full Price List</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Get access to our complete catalog of products and wholesale prices in PDF format.
        </p>
        
        <a 
          href="/Kumki-Cracker-Price-List.pdf" 
          download
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
        >
          Download PDF
        </a>
      </div>
    </main>
  )
}
