'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const type = formData.get('type') as string
  const imageFile = formData.get('imageFile') as File
  
  let imagePath: string | null = null
  
  if (imageFile && imageFile.size > 0) {
    const fs = require('fs/promises')
    const path = require('path')
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    
    await fs.writeFile(path.join(uploadDir, filename), buffer)
    imagePath = `/uploads/${filename}`
  }

  if (name && price && type) {
    await prisma.product.create({
      data: { name, price, type, imagePath }
    })
    revalidatePath('/admin/dashboard')
    revalidatePath('/products')
  }
}

export async function editProduct(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const type = formData.get('type') as string
  const imageFile = formData.get('imageFile') as File
  
  let imagePath: string | null = null
  
  if (imageFile && imageFile.size > 0) {
    const fs = require('fs/promises')
    const path = require('path')
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    
    await fs.writeFile(path.join(uploadDir, filename), buffer)
    imagePath = `/uploads/${filename}`
  }

  if (id && name && price && type) {
    const data: any = { name, price, type }
    if (imagePath) data.imagePath = imagePath
    
    await prisma.product.update({
      where: { id },
      data
    })
    revalidatePath('/admin/dashboard')
    revalidatePath('/products')
  }
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string
  if (id) {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/dashboard')
    revalidatePath('/products')
  }
}

export async function updateHeroImage(formData: FormData) {
  const imageFile = formData.get('imageFile') as File
  if (!imageFile || imageFile.size === 0) return

  const fs = require('fs/promises')
  const path = require('path')
  const buffer = Buffer.from(await imageFile.arrayBuffer())
  const filename = `hero-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  
  await fs.writeFile(path.join(uploadDir, filename), buffer)
  const imagePath = `/uploads/${filename}`

  await prisma.siteSettings.upsert({
    where: { id: 'global' },
    update: { heroImage: imagePath },
    create: { id: 'global', heroImage: imagePath }
  })
  
  revalidatePath('/')
  revalidatePath('/admin/dashboard')
}
