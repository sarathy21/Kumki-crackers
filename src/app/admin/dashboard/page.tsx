import { PrismaClient } from '@prisma/client'
import { AdminProductManager } from './AdminProductManager'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const heroSlides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' }
  })

  const globalDiscount = settings?.globalDiscount ?? 0
  const priceListPdf = settings?.priceListPdf ?? null
  const priceListData = settings?.priceListData ?? null

  // Monthly stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const monthlyOrders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfMonth } }
  })

  const stats = {
    totalOrders: monthlyOrders.length,
    monthlyRevenue: monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    totalProducts: products.length,
    pendingOrders: monthlyOrders.filter(o => o.status === 'PENDING').length
  }

  return (
    <AdminProductManager 
      products={products} 
      heroSlides={heroSlides} 
      stats={stats} 
      globalDiscount={globalDiscount} 
      priceListPdf={priceListPdf}
      priceListData={priceListData}
    />
  )
}
