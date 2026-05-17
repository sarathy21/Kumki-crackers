import { PrismaClient } from '@prisma/client'
import { ProductGrid } from '@/components/ProductGrid'

const prisma = new PrismaClient()

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' }
  })

  return (
    <main>
      <div style={{ textAlign: 'center', padding: '4rem 1rem', position: 'relative', zIndex: 10 }}>
        <h1 className="glow-text" style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 20px var(--primary)' }}>
          Kumki Crackers
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Premium Fireworks & Sparklers for Every Celebration
        </p>
      </div>

      {settings?.heroImage && (
        <div className="container" style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '1200px', 
            borderRadius: '1rem', 
            overflow: 'hidden',
            boxShadow: 'var(--shadow-glow)',
            border: '1px solid var(--border)'
          }}>
            <img 
              src={settings.heroImage} 
              alt="Hero Fireworks" 
              style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', display: 'block' }} 
            />
          </div>
        </div>
      )}

      <ProductGrid initialProducts={products} />
    </main>
  )
}
