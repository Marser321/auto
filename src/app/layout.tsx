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
          <div className="absolute inset-0 bg-[url('/demo/backgrounds/hero.jpg')] bg-cover bg-center opacity-55 animate-slow-zoom" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-[#0b1222]/60 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/30" />
          <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-accent/20 rounded-full blur-[180px] animate-float-slow" />
          <div className="absolute bottom-[-35%] right-[-10%] w-[640px] h-[640px] bg-white/10 rounded-full blur-[180px] animate-float-slower" />
          <div className="absolute top-[15%] right-[8%] w-[420px] h-[420px] bg-cyan-300/10 rounded-full blur-[160px] animate-float-slow" />
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
