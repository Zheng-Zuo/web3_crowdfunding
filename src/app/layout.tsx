import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css'
import { NavBar } from '@/components';
import { RainbowProviders } from '@/providers/RainbowProviders';
import { GlobalStatesProvider } from '@/providers/GlobalStatesProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FundMe',
  description: 'A Decentralized Crowdfunding Platform',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='scroll-smooth'>
      <body className={inter.className}>
        <GlobalStatesProvider>
          <main className="bg-white min-h-screen w-screen">
            <RainbowProviders>
              <NavBar />
              {children}
            </RainbowProviders>
          </main>
        </GlobalStatesProvider>
      </body>
    </html>
  )
}
