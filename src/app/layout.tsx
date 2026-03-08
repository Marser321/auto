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
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <InsforgeProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </InsforgeProvider>
      </body>
    </html>
  );
}
