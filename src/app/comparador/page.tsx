'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gauge, Settings2, Fuel, Calendar, Scale, X } from 'lucide-react';
import { insforge, isInsforgeConfigured } from '@/lib/insforge';
import { DEMO_VEHICLES_MAP, DEMO_PLACEHOLDER } from '@/lib/demo-vehicles';

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

const hydrateDemo = (id: string): VehiculoBase | null => {
    const vehiculo = DEMO_VEHICLES_MAP[id];
    if (!vehiculo) return null;
    return {
        id: vehiculo.id,
        imagen_url: vehiculo.imagen_url,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        precio: vehiculo.precio,
        kilometraje: vehiculo.kilometraje,
        transmision: vehiculo.transmision,
        combustible: vehiculo.combustible,
    };
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
            if (!isInsforgeConfigured) {
                const hidratados = compIds.map((id: string) => hydrateDemo(id)).filter(Boolean) as VehiculoBase[];
                setVehiculos(hidratados);
                setCargando(false);
                return;
            }

            // Intentamos cargar de Supabase
            const { data } = await insforge.database
                .from('vehicle_inventory')
                .select('*, vehicle_images(url)')
                .in('id', compIds);

            const rows = (data ?? []) as VehicleRow[];
            if (rows.length > 0) {
                const procesados = rows.map((v) => ({
                    id: v.id,
                    imagen_url: v.vehicle_images?.[0]?.url || DEMO_PLACEHOLDER,
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
                const hidratados = compIds.map((id: string) => hydrateDemo(id)).filter(Boolean) as VehiculoBase[];
                setVehiculos(hidratados);
            }
        } catch {
            const hidratados = compIds.map((id: string) => hydrateDemo(id)).filter(Boolean) as VehiculoBase[];
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
        <div className="min-h-screen px-4 py-8 sm:py-12 lg:px-8">
            <div className="max-w-7xl mx-auto surface-glass glass-dirty glass-highlight rounded-3xl p-6 sm:p-8 relative overflow-hidden">
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
                        <Link href="/catalogo" className="px-5 py-2.5 bg-black/40 border border-white/10 hover:border-white/20 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur">
                            + Añadir otro vehículo ({3 - vehiculos.length} lugares disp.)
                        </Link>
                    )}
                </div>

                {/* Tabla de Comparación - Grid dinámico basado en elementos 1x 2x 3x */}
                <div className="w-full overflow-x-auto pb-6">
                    <div
                        className="grid gap-4 min-w-[800px]"
                        style={{ gridTemplateColumns: `repeat(${vehiculos.length + 1}, minmax(0, 1fr))` }}
                    >

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
                            <div key={v.id} className="col-span-1 glass-card glass-dirty glass-highlight p-4 flex flex-col animate-fade-in relative hover:border-white/10 transition-colors group">
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
                                        <img
                                            src={v.imagen_url}
                                            alt={`${v.marca} ${v.modelo}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <h3 className="font-bold text-lg text-white leading-tight hover:text-accent transition-colors">
                                        {v.marca} {v.modelo}
                                    </h3>
                                </Link>

                                <div className="space-y-4 flex-1">
                                    <div className="h-16 flex items-center px-4 font-black text-xl text-accent bg-black/30 rounded-xl border border-white/5">{formatearPrecio(v.precio)}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-black/25 rounded-xl border border-white/5"><Calendar className="w-4 h-4 text-muted" />{v.anio}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-black/25 rounded-xl border border-white/5"><Gauge className="w-4 h-4 text-muted" />{formatearKm(v.kilometraje)}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-black/25 rounded-xl border border-white/5"><Fuel className="w-4 h-4 text-muted" />{v.combustible}</div>
                                    <div className="h-16 flex items-center gap-2 px-4 font-medium text-white bg-black/25 rounded-xl border border-white/5"><Settings2 className="w-4 h-4 text-muted" />{v.transmision}</div>
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
