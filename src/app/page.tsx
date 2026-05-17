import { PrismaClient } from '@prisma/client'
import { ProductGrid } from '@/components/ProductGrid'
import { HeroSlider } from '@/components/HeroSlider'
import { PageTransition } from '@/components/PageTransition'

const prisma = new PrismaClient()

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const heroSlides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } })
  const globalDiscount = settings?.globalDiscount ?? 0

  return (
    <main>
      <PageTransition>
        <div style={{ textAlign: 'center', padding: '4rem 1rem 2rem', position: 'relative', zIndex: 10 }}>
          <h1 className="glow-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Kumki Crackers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Premium Fireworks & Sparklers for Every Celebration
          </p>
        </div>

        <HeroSlider slides={heroSlides} />
      </PageTransition>

      <ProductGrid initialProducts={products} globalDiscount={globalDiscount} />
    </main>
  )
}
