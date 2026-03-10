import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { InsforgeProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoHub | Tu Concesionaria Digital',
  description:
    'Explorá los mejores vehículos con visualización 360°, tasación de permutas instantánea y financiación a medida. La concesionaria digital #1 de Uruguay.',
  keywords: ['autos', 'vehículos', 'concesionaria', 'permutas', '360', 'Uruguay'],
  openGraph: {
    title: 'AutoHub | Tu Concesionaria Digital',
    description: 'Los mejores vehículos con visualización 360° y tasación instantánea.',
    type: 'website',
    locale: 'es_UY',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col relative overflow-x-hidden`}>
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/demo/backgrounds/hero.jpg')] bg-cover bg-center opacity-35 animate-slow-zoom" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b1222] to-black opacity-90" />
          <div className="absolute inset-0 bg-[url('/demo/textures/noise.png')] opacity-15 mix-blend-soft-light" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/40" />
        </div>
        <InsforgeProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </InsforgeProvider>
      </body>
    </html>
  );
}
