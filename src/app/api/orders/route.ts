import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { fullName, city, district, pinCode, phoneNumber, areaName, totalAmount, discountAmount, paymentMethod, paymentStatus, utrNumber, items } = data

    // Verify all products exist
    const productIds = items.map((item: any) => item.productId)
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (existingProducts.length !== items.length) {
      return NextResponse.json(
        { error: 'Some items in your cart no longer exist. Please clear your cart and try again.' }, 
        { status: 400 }
      )
    }

    // Check stock availability
    for (const item of items) {
      const product = existingProducts.find((p: any) => p.id === item.productId)
      if (product && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${product.name}" has only ${product.stock} in stock. Please reduce quantity.` },
          { status: 400 }
        )
      }
    }

    const order = await prisma.order.create({
      data: {
        fullName,
        city,
        district,
        pinCode,
        phoneNumber,
        areaName,
        totalAmount,
        discountAmount: discountAmount || 0,
        paymentMethod,
        paymentStatus,
        utrNumber,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName || '',
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0
          }))
        }
      }
    })

    // Reduce stock for each ordered item
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: { phoneNumber: phone },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
