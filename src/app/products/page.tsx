import { PrismaClient } from '@prisma/client'
import { ProductGrid } from '@/components/ProductGrid'

const prisma = new PrismaClient()

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main>
      <section style={{ textAlign: 'center', padding: '3rem 1rem', marginBottom: '1rem' }}>
        <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Products</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Browse our extensive catalog of crackers and fireworks.
        </p>
      </section>
      
      <ProductGrid initialProducts={products} />
    </main>
  )
}
