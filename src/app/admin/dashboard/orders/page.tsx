import { PrismaClient } from '@prisma/client'
import { AdminOrdersClient } from './AdminOrdersClient'

const prisma = new PrismaClient()

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })

  return <AdminOrdersClient orders={JSON.parse(JSON.stringify(orders))} />
}
