import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // For first time setup, if no admin exists, create one with username 'admin' and password 'admin123'
    const adminCount = await prisma.admin.count()
    if (adminCount === 0) {
      const hash = await bcrypt.hash('admin123', 10)
      await prisma.admin.create({
        data: {
          username: 'admin',
          passwordHash: hash
        }
      })
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash)
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create a simple token/cookie for authentication
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
