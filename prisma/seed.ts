import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)
  
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hash,
    },
  })

  // Dummy products
  const products = [
    { name: '4" Gold Lakshmi', price: 250.00, type: 'Sound Crackers' },
    { name: '2 3/4" Bird', price: 74.00, type: 'Sound Crackers' },
    { name: '7 CM ELECTRIC', price: 58.00, type: 'Sparklers' },
    { name: '7 CM COLOUR', price: 65.00, type: 'Sparklers' },
    { name: 'CHAKKAR BIG', price: 117.00, type: 'Ground Chakkars' },
    { name: 'FLOWER POTS SMALL', price: 324.00, type: 'Flower Pot' },
    { name: '1 1/2" TWINKLING STAR', price: 120.00, type: 'Kids Noveltiles' },
    { name: 'PEACOCK', price: 1128.00, type: 'Fancy' },
    { name: 'Rocket Bomb', price: 414.00, type: 'Sky Shot' },
    { name: 'FUN SHOWER', price: 540.00, type: 'Fancy Shower' },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
