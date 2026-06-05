import prisma from '@/lib/prisma'
import { AdminOrdersClient } from './AdminOrdersClient'

export const dynamic = 'force-dynamic'


export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })

  return <AdminOrdersClient orders={JSON.parse(JSON.stringify(orders))} />
}
