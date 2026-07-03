import prisma from '@/lib/prisma'
import { PriceListClient } from './PriceListClient'

export const revalidate = 60

export default async function PriceListPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' },
    select: { priceListData: true } // Exclude Base64 PDF
  })
  
  return (
    <PriceListClient 
      priceListPdf={null} // Disabled PDF check to prevent 28MB SSG crash 
      priceListData={settings?.priceListData ?? null} 
    />
  )
}
