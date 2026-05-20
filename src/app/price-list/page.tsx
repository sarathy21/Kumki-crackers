import { PrismaClient } from '@prisma/client'
import { PriceListClient } from './PriceListClient'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export default async function PriceListPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' }
  })
  
  return (
    <PriceListClient 
      priceListPdf={settings?.priceListPdf ?? null} 
      priceListData={settings?.priceListData ?? null} 
    />
  )
}
