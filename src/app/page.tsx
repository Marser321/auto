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
  badges?: string[];
};

// Datos de ejemplo mientras no haya datos en DB
const VEHICULOS_DEMO: VehicleCardItem[] = DEMO_VEHICLES.slice(0, 6).map((v) => ({
  id: v.id,
  imagen_url: v.imagen_url,
  marca: v.marca,
  modelo: v.modelo,
  anio: v.anio,
  precio: v.precio,
  kilometraje: v.kilometraje,
  transmision: v.transmision,
  combustible: v.combustible,
  badges: v.badges,
}));

const SERVICIOS = [
  {
    icono: Eye,
    titulo: 'Visores 360° Interactivos',
    descripcion: 'Aumenta la confianza mostrando cada detalle del interior con tecnologia inmersiva 360°.',
  },
  {
    icono: Zap,
    titulo: 'Gestión Automatizada',
    descripcion: 'Integracion con CRMs y n8n para automatizar leads, tasaciones y agendamiento.',
  },
  {
    icono: LayoutDashboard,
    titulo: 'Panel Multi-Sucursal',
    descripcion: 'Inventario unificado para multiples sucursales con control centralizado y escalable.',
  },
];

const TRUSTED_LOGOS = [
  'AutoHub Group',
  'Nova Motors',
  'Distrito Cars',
  'Premium Fleet',
  'Capital Autos',
  'Northline Motor',
];

const SCALE_METRICS = [
  { label: 'Sucursales conectadas', value: '18+' },
  { label: 'Leads procesados / mes', value: '12.4k' },
  { label: 'Tiempo medio de venta', value: '-38%' },
  { label: 'Inventario activo', value: '3.2k' },
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
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-accent/15 rounded-full blur-[160px] animate-float-slow" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[160px] animate-float-slower" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 flex justify-center"
          >
            <div className="glass-panel glass-dirty glass-highlight px-8 py-10 md:px-12 md:py-12 max-w-3xl">
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

      {/* Escala y confianza */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 surface-glass glass-dirty glass-highlight">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Plataforma para crecer</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Diseñada para automotoras que venden volumen
            </h2>
            <p className="text-muted text-base leading-relaxed mb-6">
              Procesa inventario grande, coordina multiples sucursales y convierte leads con flujos claros.
              Todo con una experiencia visual premium que eleva el valor percibido del stock.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {SCALE_METRICS.map((metric) => (
                <div key={metric.label} className="p-4 glass-card glass-dirty glass-highlight rounded-xl">
                  <p className="text-2xl font-black text-white">{metric.value}</p>
                  <p className="text-xs text-muted mt-1">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel glass-dirty glass-highlight p-8">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Trusted by</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {TRUSTED_LOGOS.map((logo) => (
                <div key={logo} className="px-3 py-2 rounded-xl bg-white/5 text-center text-xs font-semibold text-white/70">
                  {logo}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/contacto">
                  Pedir demo enterprise
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 surface-glass glass-dirty glass-highlight">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              ¿Por qué <span className="text-accent">AutoHub</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICIOS.map((servicio) => (
              <div key={servicio.titulo} className="p-6 glass-card glass-dirty glass-highlight hover:border-accent/30 transition-all">
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
