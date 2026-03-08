'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gauge, Settings2, Fuel, Calendar, Scale, X } from 'lucide-react';
import { insforge } from '@/lib/insforge';

interface VehiculoBase {
    id: string;
    imagen_url: string;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    kilometraje: number;
    transmision: string;
    combustible: string;
}

// Fallback por si la db está vacía en este context
const DEMO_AUTOS: Record<string, VehiculoBase> = {
    'demo-1': { id: 'demo-1', imagen_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80', marca: 'Volkswagen', modelo: 'Gol Trend 1.6', anio: 2019, precio: 12500, kilometraje: 65000, transmision: 'Manual', combustible: 'Nafta' },
    'demo-2': { id: 'demo-2', imagen_url: 'https://images.unsplash.com/photo-1621007947382-34860ee6e992?w=600&q=80', marca: 'Chevrolet', modelo: 'Onix 1.0 Turbo', anio: 2022, precio: 16900, kilometraje: 28000, transmision: 'Automática', combustible: 'Nafta' },
    'demo-3': { id: 'demo-3', imagen_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80', marca: 'Peugeot', modelo: '208 Active 1.2', anio: 2021, precio: 15500, kilometraje: 42000, transmision: 'Manual', combustible: 'Nafta' },
    'demo-4': { id: 'demo-4', imagen_url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&q=80', marca: 'Toyota', modelo: 'Hilux SRV 2.8', anio: 2018, precio: 35000, kilometraje: 115000, transmision: 'Automática', combustible: 'Diésel' },
    'demo-5': { id: 'demo-5', imagen_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80', marca: 'Renault', modelo: 'Kwid Zen 1.0', anio: 2020, precio: 10800, kilometraje: 55000, transmision: 'Manual', combustible: 'Nafta' },
    'demo-6': { id: 'demo-6', imagen_url: 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=600&q=80', marca: 'Ford', modelo: 'Fiesta Kinetic Design', anio: 2017, precio: 11500, kilometraje: 89000, transmision: 'Manual', combustible: 'Nafta' },
};

function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);
}

function formatearKm(km: number): string {
    return new Intl.NumberFormat('es-UY').format(km) + ' km';
}

export default function ComparadorPage() {
    const [cargando, setCargando] = useState(true);
    const [vehiculos, setVehiculos] = useState<VehiculoBase[]>([]);

    const cargarComparador = async () => {
        const compIds = JSON.parse(localStorage.getItem('autohub_comparador') || '[]');
        if (compIds.length === 0) {
            setVehiculos([]);
            setCargando(false);
            return;
        }

        try {
            // Intentamos cargar de Supabase
            const { data } = await insforge.database
                .from('vehicle_inventory')
                .select('*, vehicle_images(url)')
                .in('id', compIds);

            if (data && data.length > 0) {
                const procesados = data.map((v: any) => ({
                    id: v.id,
                    imagen_url: v.vehicle_images?.[0]?.url || 'https://via.placeholder.com/600x400',
                    marca: v.marca,
                    modelo: v.modelo,
                    anio: v.anio,
                    precio: v.precio,
                    kilometraje: v.kilometraje,
                    transmision: v.transmision,
                    combustible: v.combustible,
                }));
                // Mantenemos el orden de ids que tenían o filtramos demos localmente
                setVehiculos(procesados);
            } else {
                // Caemos a los datos demo si están en localStorage (muy probable)
                const hidratados = compIds.map((id: string) => DEMO_AUTOS[id]).filter(Boolean);
                setVehiculos(hidratados);
            }
        } catch {
            const hidratados = compIds.map((id: string) => DEMO_AUTOS[id]).filter(Boolean);
            setVehiculos(hidratados);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarComparador();
        const handler = () => cargarComparador();
        window.addEventListener('comparadorActualizados', handler);
        return () => window.removeEventListener('comparadorActualizados', handler);
    }, []);

    const quitarVehiculo = (id: string) => {
        const comp = JSON.parse(localStorage.getItem('autohub_comparador') || '[]');
        const netos = comp.filter((c: string) => c !== id);
        localStorage.setItem('autohub_comparador', JSON.stringify(netos));
        window.dispatchEvent(new Event('comparadorActualizados'));
    };

    if (cargando) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (vehiculos.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <Scale className="w-16 h-16 text-white/10 mb-6" />
                <h2 className="text-3xl font-black text-white mb-3">Tu comparador está vacío</h2>
                <p className="text-muted max-w-md mx-auto mb-8">
                    Seleccioná el ícono de la balanza en el catálogo para añadir vehículos y comparar sus especificaciones lado a lado.
                </p>
                <Link href="/catalogo" className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all">
                    Explorar Catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface px-4 py-8 sm:py-12 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al catálogo
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                            <Scale className="w-8 h-8 text-accent" />
                            Comparador
                        </h1>
                    </div>
                    {vehiculos.length < 3 && (
                        <Link href="/catalogo" className="px-5 py-2.5 bg-surface-secondary border border-white/10 hover:border-white/20 text-white text-sm font-semibold rounded-xl transition-all">
                            + Añadir otro vehículo ({3 - vehiculos.length} lugares disp.)
                        </Link>
                    )}
                </div>

                {/* Tabla de Comparación - Grid dinámico basado en elementos 1x 2x 3x */}
                <div className="w-full overflow-x-auto pb-6">
                    <div className={`grid grid-cols-${vehiculos.length + 1} gap-4 min-w-[800px]`}>

                        {/* Columna Cabeceras Fijas */}
                        <div className="col-span-1 pt-48 flex flex-col space-y-4">
                            <div className="h-16 flex items-center px-4 font-bold text-sm text-white/50 bg-black/20 rounded-l-xl">Precio</div>
                            <div className="h-16 flex items-center px-4 text-sm text-white/50 bg-black/20 rounded-l-xl">Año</div>
                            <div className="h-16 flex items-center px-4 text-sm text-white/50 bg-black/20 rounded-l-xl">Kilometraje</div>
                            <div className="h-16 flex items-center px-4 text-sm text-white/50 bg-black/20 rounded-l-xl">Motor / Combust.</div>
                            <div className="h-16 flex items-center px-4 text-sm text-white/50 bg-black/20 rounded-l-xl">Transmisión</div>
                        </div>

                        {/* Columnas Dinámicas para cada auto en Comparación */}
                        {vehiculos.map((v) => (
                            <div key={v.id} className="col-span-1 bg-surface-secondary border border-white/5 rounded-2xl p-4 flex flex-col animate-fade-in relative hover:border-white/10 transition-colors group">
                                <button
                                    onClick={() => quitarVehiculo(v.id)}
                                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20"
                                    title="Quitar"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {/* Target Header (Img + Titulo) */}
                                <Link href={`/catalogo/${v.id}`} className="block mb-6 h-40">
                                    <div className="aspect-[16/10] overflow-hidden rounded-xl mb-3 border border-white/5">
                                        <img src={v.imagen_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-lg text-white leading-tight hover:text-accent transition-colors">
                                        {v.marca} {v.modelo}
                                    </h3>
                                </Link>

                                <div className="space-y-4 flex-1">
                                    <div className="h-16 flex items-center px-4 font-black text-xl text-accent bg-surface-tertiary rounded-xl">{formatearPrecio(v.precio)}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-surface-tertiary rounded-xl"><Calendar className="w-4 h-4 text-muted" />{v.anio}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-surface-tertiary rounded-xl"><Gauge className="w-4 h-4 text-muted" />{formatearKm(v.kilometraje)}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-surface-tertiary rounded-xl"><Fuel className="w-4 h-4 text-muted" />{v.combustible}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-surface-tertiary rounded-xl"><Settings2 className="w-4 h-4 text-muted" />{v.transmision}</div>
                                </div>

                                <Link
                                    href={`/catalogo/${v.id}`}
                                    className="block mt-6 w-full py-3 bg-accent/10 hover:bg-accent hover:text-white text-accent text-center text-sm font-bold rounded-xl transition-colors"
                                >
                                    Ver Detalle
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
