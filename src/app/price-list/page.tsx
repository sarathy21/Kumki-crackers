import prisma from '@/lib/prisma'
import { PriceListClient } from './PriceListClient'

export const revalidate = 60

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
