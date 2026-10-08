import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FeedbackButton from '@/components/FeedbackButton'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'TCS JL Tracker — Track Joining Letters, Share Timelines',
  description: 'An unofficial community platform for tracking TCS joining letters, sharing timelines, and connecting with peers.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: '1', padding: 'var(--spacing-8) 0' }}>
            {children}
          </main>
          <Footer />
          <FeedbackButton />
        </div>
      </body>
    </html>
  )
}
