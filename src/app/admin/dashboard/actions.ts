'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const type = formData.get('type') as string
  const discount = parseInt(formData.get('discount') as string) || 0
  const stock = parseInt(formData.get('stock') as string) || 0
  const imageFile = formData.get('imageFile') as File
  
  let imagePath: string | null = null
  
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const mimeType = imageFile.type || 'image/jpeg'
    imagePath = `data:${mimeType};base64,${buffer.toString('base64')}`
  }

  if (name && price && type) {
    await prisma.product.create({
      data: { name, price, type, discount, stock, imagePath }
    })
    revalidatePath('/admin/dashboard')
    revalidatePath('/products')
    revalidatePath('/')
  }
}

export async function editProduct(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const type = formData.get('type') as string
  const discount = parseInt(formData.get('discount') as string) || 0
  const stock = parseInt(formData.get('stock') as string) || 0
  const imageFile = formData.get('imageFile') as File
  
  let imagePath: string | null = null
  
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const mimeType = imageFile.type || 'image/jpeg'
    imagePath = `data:${mimeType};base64,${buffer.toString('base64')}`
  }

  if (id && name && price && type) {
    const data: any = { name, price, type, discount, stock }
    if (imagePath) data.imagePath = imagePath
    await prisma.product.update({ where: { id }, data })
    revalidatePath('/admin/dashboard')
    revalidatePath('/products')
    revalidatePath('/')
  }
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string
  if (id) {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/dashboard')
    revalidatePath('/products')
    revalidatePath('/')
  }
}

export async function addHeroSlide(formData: FormData) {
  const imageFile = formData.get('imageFile') as File
  if (!imageFile || imageFile.size === 0) return

  const buffer = Buffer.from(await imageFile.arrayBuffer())
  const mimeType = imageFile.type || 'image/jpeg'
  const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`
  
  const count = await prisma.heroSlide.count()
  await prisma.heroSlide.create({
    data: { imagePath: base64Image, sortOrder: count }
  })
  revalidatePath('/')
  revalidatePath('/admin/dashboard')
}

export async function deleteHeroSlide(formData: FormData) {
  const id = formData.get('id') as string
  if (id) {
    await prisma.heroSlide.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/admin/dashboard')
  }
}

export async function updateOrderStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  if (id && status) {
    await prisma.order.update({ where: { id }, data: { status } })
    revalidatePath('/admin/dashboard/orders')
  }
}

export async function cancelOrder(formData: FormData) {
  const id = formData.get('id') as string
  const reason = formData.get('reason') as string
  if (!id) return

  // Restore stock for cancelled order items
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  })

  if (order && order.status !== 'CANCELLED') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      })
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancelReason: reason || 'No reason provided' }
    })
  }

  revalidatePath('/admin/dashboard/orders')
  revalidatePath('/products')
  revalidatePath('/')
}

export async function updateGlobalDiscount(formData: FormData) {
  const discount = parseInt(formData.get('discount') as string) || 0
  await prisma.siteSettings.upsert({
    where: { id: 'global' },
    create: { id: 'global', globalDiscount: discount },
    update: { globalDiscount: discount }
  })
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin/dashboard')
}
