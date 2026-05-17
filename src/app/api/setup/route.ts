import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    })

    const passwordHash = await bcrypt.hash('kumki123', 10)

    if (existingAdmin) {
      await prisma.admin.update({
        where: { username: 'admin' },
        data: { passwordHash }
      })
      // Ensure global settings exist
      await prisma.siteSettings.upsert({
        where: { id: 'global' },
        create: { id: 'global', globalDiscount: 0 },
        update: {}
      })
      return NextResponse.json({ message: 'Admin password updated to kumki123 successfully' })
    }
    await prisma.admin.create({
      data: {
        username: 'admin',
        passwordHash
      }
    })

    // Create global site settings if missing
    await prisma.siteSettings.upsert({
      where: { id: 'global' },
      create: { id: 'global', globalDiscount: 0 },
      update: {}
    })

    return NextResponse.json({ message: 'Admin user created successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
