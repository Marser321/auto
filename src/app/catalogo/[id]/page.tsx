'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Maximize2,
    Fuel, Gauge, Settings2, Calendar, Palette, Hash,
    Phone, MessageCircle, X, AlertTriangle, Star, Info, Gem, Wallet
} from 'lucide-react';
import { insforge, isInsforgeConfigured } from '@/lib/insforge';
import Viewer360Modal from '@/components/Viewer360Modal';
import type { Hotspot360 } from '@/components/Viewer360';
import { DEMO_VEHICLES, getDemoVehicleById } from '@/lib/demo-vehicles';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
interface Vehiculo {
    id: string;
    vin: string;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    kilometraje: number;
    transmision: string;
    combustible: string;
    color: string;
    descripcion: string;
    estado: string;
    imagen_360_url?: string;
    badges?: string[];
    highlights?: string[];
    inspeccion?: { puntos: number; resumen: string };
    historial?: { titulo: string; detalle: string }[];
}

interface Imagen {
    id: string;
    url: string;
    tipo: string;
    orden: number;
}

interface Hotspot2D {
    id: string;
    pos_x: number;
    pos_y: number;
    titulo: string;
    descripcion: string;
    tipo: 'damage' | 'luxury' | 'feature';
}

const DEFAULT_DEMO = DEMO_VEHICLES[0];

const DEMO_HOTSPOTS_2D: Hotspot2D[] = [
    { id: '1', pos_x: 25, pos_y: 40, titulo: 'Techo panorámico', descripcion: 'Techo panorámico de cristal con apertura eléctrica y cortina parasol.', tipo: 'luxury' },
    { id: '2', pos_x: 70, pos_y: 60, titulo: 'Llantas AMG 19"', descripcion: 'Llantas de aleación AMG de 19 pulgadas con diseño de 5 rayos dobles.', tipo: 'feature' },
    { id: '3', pos_x: 50, pos_y: 30, titulo: 'Pequeño rayón', descripcion: 'Rayón superficial de 3cm en el paragolpes delantero. No afecta la estructura.', tipo: 'damage' },
];

const DEMO_HOTSPOTS_360: Hotspot360[] = [
    { id: '360-1', yaw: 0, pitch: 0, titulo: 'Cuero Nappa Premium', descripcion: 'Tapizado completo en cuero Nappa color crema con costuras diamante. Tratamiento antimanchas y calefacción/ventilación en asientos delanteros.', tipo: 'material' },
    { id: '360-2', yaw: 45, pitch: 10, titulo: 'Pantalla MBUX 12.3"', descripcion: 'Sistema multimedia Mercedes-Benz User Experience con pantalla táctil de 12.3 pulgadas, navegación con realidad aumentada y control por voz "Hey Mercedes".', tipo: 'luxury' },
    { id: '360-3', yaw: 90, pitch: -5, titulo: 'Molduras de Aluminio Cepillado', descripcion: 'Insertos decorativos en aluminio cepillado oscuro con acabado premium. Realzan el carácter deportivo del paquete AMG Line.', tipo: 'material' },
    { id: '360-4', yaw: 135, pitch: 15, titulo: 'Iluminación Ambiental 64 Colores', descripcion: 'Sistema de iluminación ambiental con 64 colores seleccionables y 10 programas de color. LEDs integrados en puertas, consola central y tablero.', tipo: 'luxury' },
    { id: '360-5', yaw: 180, pitch: -10, titulo: 'Fibra de Carbono AMG', descripcion: 'Aplicaciones en fibra de carbono auténtica en volante, consola central y manijas de puerta. Exclusivo del paquete AMG Line.', tipo: 'material' },
    { id: '360-6', yaw: 225, pitch: 5, titulo: 'Volante Deportivo AMG', descripcion: 'Volante multifunción AMG en cuero Nappa con levas de cambio en aluminio, botones touch-control y banda roja a las 12.', tipo: 'feature' },
    { id: '360-7', yaw: 270, pitch: 20, titulo: 'Techo Panorámico de Cristal', descripcion: 'Techo panorámico corredizo con apertura eléctrica, cortina parasol automática y vidrio con filtro UV/IR.', tipo: 'luxury' },
    { id: '360-8', yaw: 315, pitch: -15, titulo: 'Parlantes Burmester®', descripcion: 'Sistema de sonido surround Burmester® de alta gama con 13 parlantes, 590W de potencia y sonido 3D envolvente.', tipo: 'feature' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);
}

function formatearKm(km: number): string {
    return new Intl.NumberFormat('es-UY').format(km) + ' km';
}

function HotspotIcon({ tipo }: { tipo: string }) {
    if (tipo === 'damage') return <AlertTriangle className="w-3 h-3" />;
    if (tipo === 'luxury') return <Star className="w-3 h-3" />;
    if (tipo === 'material') return <Gem className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
}

function hotspotColor(tipo: string): string {
    if (tipo === 'damage') return 'bg-yellow-500 hover:bg-yellow-400 border-yellow-400';
    if (tipo === 'luxury') return 'bg-purple-500 hover:bg-purple-400 border-purple-400';
    if (tipo === 'material') return 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400';
    return 'bg-blue-500 hover:bg-blue-400 border-blue-400';
}

// ─────────────────────────────────────────────
// VDP Page
// ─────────────────────────────────────────────
export default function VDPPage() {
    const params = useParams();
    const id = params?.id as string;

    const [vehiculo, setVehiculo] = useState<Vehiculo>(DEFAULT_DEMO);
    const [imagenes, setImagenes] = useState<Imagen[]>(DEFAULT_DEMO.imagenes);
    const [hotspots2D, setHotspots2D] = useState<Hotspot2D[]>(DEMO_HOTSPOTS_2D);
    const [hotspots360, setHotspots360] = useState<Hotspot360[]>(DEMO_HOTSPOTS_360);
    const [imagenActiva, setImagenActiva] = useState(0);
    const [hotspotActivo, setHotspotActivo] = useState<string | null>(null);
    const [mostrar360, setMostrar360] = useState(false);

    // Estado del Simulador
    const [entregaInicial, setEntregaInicial] = useState<number>(DEFAULT_DEMO.precio * 0.3); // 30% default
    const [plazoMeses, setPlazoMeses] = useState<number>(36);

    // Cálculo básico (simulado, TNA ~15%)
    const calcularCuota = () => {
        const capital = vehiculo.precio - entregaInicial;
        if (capital <= 0) return 0;
        const tasaMensual = 0.15 / 12;
        const cuota = (capital * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / (Math.pow(1 + tasaMensual, plazoMeses) - 1);
        return Math.round(cuota);
    };

    // Cargar datos reales
    useEffect(() => {
        const demo = getDemoVehicleById(id);
        if (demo) {
            setVehiculo(demo);
            setImagenes(demo.imagenes);
            setEntregaInicial(demo.precio * 0.3);
            return;
        }

        if (!id || id.startsWith('demo-') || !isInsforgeConfigured) return;

        async function cargar() {
            try {
                const { data: vData } = await insforge.database
                    .from('vehicle_inventory')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (vData) {
                    setVehiculo(vData as Vehiculo);
                    setEntregaInicial((vData as Vehiculo).precio * 0.3);
                }

                const { data: imgData } = await insforge.database
                    .from('vehicle_images')
                    .select('*')
                    .eq('vehicle_id', id)
                    .order('orden', { ascending: true });

                if (imgData && imgData.length > 0) setImagenes(imgData as Imagen[]);

                const { data: hData } = await insforge.database
                    .from('vehicle_features')
                    .select('*')
                    .eq('vehicle_id', id);

                if (hData && hData.length > 0) setHotspots2D(hData as Hotspot2D[]);

                // Cargar hotspots 360°
                const { data: h360Data } = await insforge.database
                    .from('vehicle_360_hotspots')
                    .select('*')
                    .eq('vehicle_id', id);

                if (h360Data && h360Data.length > 0) setHotspots360(h360Data as Hotspot360[]);
            } catch {
                // Fallback a demo
            }
        }
        cargar();
    }, [id]);

    const specs = [
        { icono: Calendar, label: 'Año', valor: vehiculo.anio.toString() },
        { icono: Gauge, label: 'Kilometraje', valor: formatearKm(vehiculo.kilometraje) },
        { icono: Settings2, label: 'Transmisión', valor: vehiculo.transmision },
        { icono: Fuel, label: 'Combustible', valor: vehiculo.combustible },
        { icono: Palette, label: 'Color', valor: vehiculo.color },
        { icono: Hash, label: 'VIN', valor: vehiculo.vin },
    ];

    const badges = vehiculo.badges?.length ? vehiculo.badges : (tiene360 ? ['360'] : []);

    // JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Car',
        name: `${vehiculo.anio} ${vehiculo.marca} ${vehiculo.modelo}`,
        brand: { '@type': 'Brand', name: vehiculo.marca },
        model: vehiculo.modelo,
        vehicleIdentificationNumber: vehiculo.vin,
        modelDate: vehiculo.anio.toString(),
        mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehiculo.kilometraje, unitCode: 'KMT' },
        fuelType: vehiculo.combustible,
        vehicleTransmission: vehiculo.transmision,
        color: vehiculo.color,
        offers: { '@type': 'Offer', price: vehiculo.precio, priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        image: imagenes[0]?.url,
        description: vehiculo.descripcion,
    };

    const tiene360 = Boolean(vehiculo.imagen_360_url);

    return (
        <>
            {/* JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Modal 360° */}
            {tiene360 && (() => {
                const img360 = vehiculo.marca === 'BMW' ? '/360/car-interior-2.jpg'
                    : vehiculo.marca === 'Audi' ? '/360/car-interior-3.jpg'
                        : vehiculo.imagen_360_url!;
                return (
                    <Viewer360Modal
                        visible={mostrar360}
                        onCerrar={() => setMostrar360(false)}
                        imagen={img360}
                        hotspots={hotspots360}
                        titulo={`${vehiculo.marca} ${vehiculo.modelo} — Tour Interior 360°`}
                    />
                );
            })()}

            <div className="min-h-screen">
                {/* Breadcrumb */}
                <div className="bg-surface border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <Link href="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al catálogo
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Galería */}
                        <div>
                            {/* Imagen principal con hotspots 2D */}
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-secondary group">
                                <img
                                    src={imagenes[imagenActiva]?.url}
                                    alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Hotspots 2D overlay */}
                                {imagenActiva === 0 && hotspots2D.map((hs) => (
                                    <button
                                        key={hs.id}
                                        onClick={() => setHotspotActivo(hotspotActivo === hs.id ? null : hs.id)}
                                        className={`absolute w-7 h-7 rounded-full border-2 flex items-center justify-center text-white transition-all duration-200 animate-pulse-slow ${hotspotColor(hs.tipo)} ${hotspotActivo === hs.id ? 'scale-125 ring-2 ring-white/50' : ''}`}
                                        style={{ left: `${hs.pos_x}%`, top: `${hs.pos_y}%`, transform: 'translate(-50%, -50%)' }}
                                        title={hs.titulo}
                                    >
                                        <HotspotIcon tipo={hs.tipo} />
                                    </button>
                                ))}

                                {/* Tooltip hotspot 2D activo */}
                                {hotspotActivo && (() => {
                                    const hs = hotspots2D.find((h) => h.id === hotspotActivo);
                                    if (!hs) return null;
                                    return (
                                        <div
                                            className="absolute z-20 w-64 p-4 bg-black/90 backdrop-blur-sm rounded-xl border border-white/10 animate-fade-in"
                                            style={{ left: `${Math.min(hs.pos_x, 60)}%`, top: `${Math.min(hs.pos_y + 5, 70)}%` }}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-bold text-white">{hs.titulo}</h4>
                                                <button onClick={() => setHotspotActivo(null)} className="text-muted hover:text-white">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="mt-1 text-xs text-muted leading-relaxed">{hs.descripcion}</p>
                                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${hs.tipo === 'damage' ? 'bg-yellow-500/20 text-yellow-300' :
                                                hs.tipo === 'luxury' ? 'bg-purple-500/20 text-purple-300' :
                                                    'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                {hs.tipo === 'damage' ? 'Daño' : hs.tipo === 'luxury' ? 'Lujo' : 'Característica'}
                                            </span>
                                        </div>
                                    );
                                })()}

                                {/* Navegación de galería */}
                                {imagenes.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setImagenActiva((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setImagenActiva((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {/* Contador */}
                                <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
                                    {imagenActiva + 1} / {imagenes.length}
                                </div>

                                {/* Badge 360° */}
                                {tiene360 && (
                                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-accent/90 backdrop-blur-sm text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                                        <Maximize2 className="w-3 h-3" />
                                        360° disponible
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                {imagenes.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setImagenActiva(idx)}
                                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${imagenActiva === idx ? 'border-accent' : 'border-white/10 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Botón 360° Premium */}
                            {tiene360 && (
                                <button
                                    onClick={() => setMostrar360(true)}
                                    className="mt-4 w-full group relative overflow-hidden py-5 bg-gradient-to-r from-accent via-red-600 to-accent text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.01]"
                                >
                                    {/* Efecto shimmer */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                    <div className="relative flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <Maximize2 className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-base font-black">Tour Interior 360°</span>
                                            <span className="block text-xs text-white/70 font-normal">
                                                {hotspots360.length} puntos de interés • Materiales • Equipamiento
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )}
                            {tiene360 && (
                                <p className="mt-3 text-xs text-muted leading-relaxed">
                                    El tour 360 reduce dudas, mejora la confianza y acelera decisiones de compra.
                                </p>
                            )}
                        </div>

                        {/* Info del vehículo */}
                        <div>
                            <div className="sticky top-20 space-y-6">
                                <div>
                                    <p className="text-sm text-accent font-semibold uppercase tracking-wider">{vehiculo.marca}</p>
                                    <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">{vehiculo.modelo}</h1>
                                    <p className="text-4xl font-black text-accent mt-3">{formatearPrecio(vehiculo.precio)}</p>
                                    {badges.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {badges.map((badge) => (
                                                <span key={badge} className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-white/5 text-white border border-white/10">
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Specs grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {specs.map((spec) => (
                                        <div key={spec.label} className="p-3 bg-surface-secondary rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 text-muted mb-1">
                                                <spec.icono className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-medium">{spec.label}</span>
                                            </div>
                                            <p className="text-sm font-semibold text-white truncate">{spec.valor}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Descripción */}
                                <div className="p-4 bg-surface-secondary rounded-xl border border-white/5">
                                    <h3 className="text-sm font-semibold text-white mb-2">Descripción</h3>
                                    <p className="text-sm text-muted leading-relaxed">{vehiculo.descripcion}</p>
                                </div>

                                {vehiculo.highlights && vehiculo.highlights.length > 0 && (
                                    <div className="p-4 bg-surface-secondary rounded-xl border border-white/5">
                                        <h3 className="text-sm font-semibold text-white mb-2">Lo mejor de este auto</h3>
                                        <ul className="grid grid-cols-1 gap-2">
                                            {vehiculo.highlights.map((item) => (
                                                <li key={item} className="text-sm text-muted flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {vehiculo.inspeccion && (
                                    <div className="p-4 bg-surface-secondary rounded-xl border border-white/5">
                                        <h3 className="text-sm font-semibold text-white mb-2">Garantia e inspeccion</h3>
                                        <p className="text-sm text-muted leading-relaxed">{vehiculo.inspeccion.resumen}</p>
                                        <p className="text-xs text-white/70 mt-2">
                                            {vehiculo.inspeccion.puntos} puntos verificados
                                        </p>
                                    </div>
                                )}

                                {vehiculo.historial && vehiculo.historial.length > 0 && (
                                    <div className="p-4 bg-surface-secondary rounded-xl border border-white/5">
                                        <h3 className="text-sm font-semibold text-white mb-2">Historial y transparencia</h3>
                                        <div className="space-y-3">
                                            {vehiculo.historial.map((item) => (
                                                <div key={item.titulo}>
                                                    <p className="text-sm font-semibold text-white">{item.titulo}</p>
                                                    <p className="text-xs text-muted">{item.detalle}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Simulador de Financiación */}
                                <div className="p-5 bg-surface-secondary rounded-xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] translate-x-10 -translate-y-10" />
                                    <h3 className="text-base font-bold text-white mb-4 relative z-10 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-accent" />
                                        Simulador de Cuotas
                                    </h3>

                                    <div className="space-y-4 relative z-10">
                                        {/* Entrega Inicial */}
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="text-xs font-medium text-muted">Entrega Inicial (USD)</label>
                                                <span className="text-sm font-bold text-white">{formatearPrecio(entregaInicial)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={vehiculo.precio * 0.9}
                                                step={500}
                                                value={entregaInicial}
                                                onChange={(e) => setEntregaInicial(Number(e.target.value))}
                                                className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
                                            />
                                        </div>

                                        {/* Plazos */}
                                        <div>
                                            <label className="text-xs font-medium text-muted mb-2 block">Plazo de Financiación</label>
                                            <div className="flex gap-2">
                                                {[12, 24, 36, 48, 60].map((meses) => (
                                                    <button
                                                        key={meses}
                                                        onClick={() => setPlazoMeses(meses)}
                                                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${plazoMeses === meses
                                                                ? 'bg-accent text-white border border-accent'
                                                                : 'bg-surface-tertiary text-muted border border-transparent hover:text-white hover:border-white/10'
                                                            }`}
                                                    >
                                                        {meses}m
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Resultado */}
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted mb-0.5">Cuota Mensual Estimada</p>
                                                <p className="text-2xl font-black text-accent">{formatearPrecio(calcularCuota())}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-muted max-w-[100px] leading-tight">Sujeto a aprobación crediticia. TNA ~15%.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="space-y-3">
                                    <a
                                        href={`https://wa.me/59899123456?text=${encodeURIComponent(`Hola! Me interesa el ${vehiculo.anio} ${vehiculo.marca} ${vehiculo.modelo} (VIN: ${vehiculo.vin})`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Consultar por WhatsApp
                                    </a>
                                    <Link
                                        href="/permutas"
                                        className="w-full py-4 bg-surface-secondary hover:bg-surface-tertiary text-white font-semibold rounded-xl flex items-center justify-center gap-3 border border-white/10 transition-colors"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Quiero permutar mi auto
                                    </Link>
                                </div>

                                {/* Leyenda hotspots */}
                                <div className="p-4 bg-surface-secondary rounded-xl border border-white/5">
                                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Leyenda de marcadores</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { color: 'bg-yellow-500', label: 'Detalle' },
                                            { color: 'bg-purple-500', label: 'Lujo' },
                                            { color: 'bg-emerald-500', label: 'Material' },
                                            { color: 'bg-blue-500', label: 'Característica' },
                                        ].map((item) => (
                                            <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted">
                                                <span className={`w-3 h-3 rounded-full ${item.color}`} />
                                                {item.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
