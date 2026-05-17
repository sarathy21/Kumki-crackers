import { PrismaClient } from '@prisma/client'
import { AdminProductManager } from './AdminProductManager'

const prisma = new PrismaClient()

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <AdminProductManager products={products} />
}
