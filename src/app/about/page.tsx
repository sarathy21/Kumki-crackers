import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>About Us</h1>
      
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '1rem', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Greetings from <strong>Kumki Crackers</strong>. We have been in the cracker industry for the past 25 years. 
          We take pride in supplying our customers with top-quality crackers at the best market prices.
        </p>
        
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Our quality and safety standards have earned us loyal and happy customers over the years. 
          Celebrate every special moment with our vibrant firework products including premium flower pots and sky-filling aerial shots.
        </p>
        
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Contact Information</h3>
          <p>Ratna colony, Naranapuram road, Sivakasi - 626189.</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--primary)' }}>Phone: 88382 81866</p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link href="/" className="btn-primary">Explore Products</Link>
      </div>
    </main>
  )
}
