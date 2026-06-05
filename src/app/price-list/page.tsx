import prisma from '@/lib/prisma'
import { PriceListClient } from './PriceListClient'

export const revalidate = 60

export default async function PriceListPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' },
    select: { priceListData: true, priceListPdf: true }
  })
  
  return (
    <PriceListClient 
      priceListPdf={settings?.priceListPdf ? 'exists' : null} 
      priceListData={settings?.priceListData ?? null} 
    />
  )
}
