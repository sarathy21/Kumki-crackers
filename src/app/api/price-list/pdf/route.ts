import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
      select: { priceListPdf: true }
    })

    if (!settings?.priceListPdf) {
      return new NextResponse('PDF not found', { status: 404 })
    }

    const base64String = settings.priceListPdf

    // Extract the base64 content
    // Format is usually: "data:application/pdf;base64,JVBER..."
    const parts = base64String.split(',')
    const base64Data = parts.length > 1 ? parts[1] : parts[0]

    const buffer = Buffer.from(base64Data, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Kumki-Cracker-Price-List.pdf"'
      }
    })
  } catch (error) {
    console.error('Error fetching PDF:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
