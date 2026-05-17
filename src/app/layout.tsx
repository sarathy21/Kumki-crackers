import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CursorSparkle } from '@/components/CursorSparkle'
import './globals.css'
import type { Metadata } from 'next'
import { Outfit, Inter } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Kumki Crackers | Premium Fireworks',
  description: 'Wholesale & Retail of Quality Fancy Fireworks, Crackers, Sparklers & Gift Boxes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <CursorSparkle />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
