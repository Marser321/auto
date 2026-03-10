'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, ChevronRight, Zap, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import VehicleCard from '@/components/VehicleCard';
import { insforge, isInsforgeConfigured } from '@/lib/insforge';
import { DEMO_VEHICLES, DEMO_PLACEHOLDER } from '@/lib/demo-vehicles';

type VehicleCardItem = {
  id: string;
  imagen_url: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  kilometraje: number;
  transmision: string;
  combustible: string;
};

// Datos de ejemplo mientras no haya datos en DB
const VEHICULOS_DEMO: VehicleCardItem[] = DEMO_VEHICLES.slice(0, 3).map((v) => ({
  id: v.id,
  imagen_url: v.imagen_url,
  marca: v.marca,
  modelo: v.modelo,
  anio: v.anio,
  precio: v.precio,
  kilometraje: v.kilometraje,
  transmision: v.transmision,
  combustible: v.combustible,
}));

const SERVICIOS = [
  {
    icono: Eye,
    titulo: 'Visores 360° Interactivos',
    descripcion: 'Generá mayor confianza en tus clientes permitiéndoles explorar cada detalle del interior con tecnología inmersiva.',
  },
  {
    icono: Zap,
    titulo: 'Gestión Automatizada',
    descripcion: 'Integración fluida con n8n y CRMs para automatizar la captura de leads, tasaciones de permutas y agendamiento.',
  },
  {
    icono: LayoutDashboard,
    titulo: 'Panel Multi-Sucursal',
    descripcion: 'Administrá el inventario de múltiples agencias desde un único dashboard centralizado y escalable en la nube.',
  },
];

type VehicleImageRow = { url: string };
type VehicleRow = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  kilometraje: number;
  transmision: string;
  combustible: string;
  vehicle_images?: VehicleImageRow[] | null;
};

export default function HomePage() {
  const [vehiculos, setVehiculos] = useState<VehicleCardItem[]>(VEHICULOS_DEMO);

  useEffect(() => {
    if (!isInsforgeConfigured) {
      return;
    }

    async function cargar() {
      try {
        const { data } = await insforge.database
          .from('vehicle_inventory')
          .select('*, vehicle_images(url)')
          .eq('estado', 'disponible')
          .order('created_at', { ascending: false })
          .limit(6);

        const rows = (data ?? []) as VehicleRow[];
        if (rows.length > 0) {
          setVehiculos(rows.map((v) => ({
            id: v.id,
            imagen_url: v.vehicle_images?.[0]?.url || DEMO_PLACEHOLDER,
            marca: v.marca,
            modelo: v.modelo,
            anio: v.anio,
            precio: v.precio,
            kilometraje: v.kilometraje,
            transmision: v.transmision,
            combustible: v.combustible,
          })));
        }
      } catch (error) {
        console.error('Error cargando destacados:', error);
      }
    }
    cargar();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-surface to-black" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Nuevos ingresos disponibles
            </div>

            <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Tu próximo auto <br />
              <span className="text-accent">te espera acá</span>
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Explorá nuestro catálogo con visualización 360° interactiva,
              tasá tu auto actual y llevate el que siempre quisiste.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/catalogo">
                  Ver Catálogo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/permutas">
                  Tasá Tu Auto
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vehículos Destacados */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Vehículos <span className="text-accent">Destacados</span>
              </h2>
              <p className="mt-2 text-muted">Los últimos ingresos a nuestro catálogo</p>
            </div>
            <Link
              href="/catalogo"
              className="hidden sm:inline-flex items-center gap-2 text-accent hover:text-accent-hover font-semibold transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiculos.map((vehiculo) => (
              <VehicleCard key={vehiculo.id} {...vehiculo} />
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              ¿Por qué <span className="text-accent">AutoHub</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICIOS.map((servicio) => (
              <div key={servicio.titulo} className="p-6 bg-surface-secondary rounded-2xl border border-white/5 hover:border-accent/30 transition-all">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <servicio.icono className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{servicio.titulo}</h3>
                <p className="text-sm text-muted leading-relaxed">{servicio.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
