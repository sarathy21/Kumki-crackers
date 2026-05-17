import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { fullName, city, district, pinCode, phoneNumber, areaName, totalAmount, paymentMethod, paymentStatus, utrNumber, items } = data

    // Verify all products exist to prevent foreign key constraint errors
    const productIds = items.map((item: any) => item.productId)
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (existingProducts.length !== items.length) {
      return NextResponse.json(
        { error: 'Cart Sync Error: Some items in your cart no longer exist in our database. Please clear your cart and add the items again.' }, 
        { status: 400 }
      )
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
        paymentMethod,
        paymentStatus,
        utrNumber,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
