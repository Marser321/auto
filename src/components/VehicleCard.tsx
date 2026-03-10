'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Fuel, Gauge, Settings2, Heart, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VehicleCardProps {
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
}

function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(precio);
}

function formatearKm(km: number): string {
    return new Intl.NumberFormat('es-UY').format(km) + ' km';
}

import { cn } from '@/lib/utils';

export default function VehicleCard({
    id,
    imagen_url,
    marca,
    modelo,
    anio,
    precio,
    kilometraje,
    transmision,
    combustible,
    badges,
}: VehicleCardProps) {
    const [esFavorito, setEsFavorito] = useState(false);
    const [enComparador, setEnComparador] = useState(false);

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('autohub_favoritos') || '[]');
        setEsFavorito(favs.includes(id));

        const comp = JSON.parse(localStorage.getItem('autohub_comparador') || '[]');
        setEnComparador(comp.includes(id));
    }, [id]);

    const toggleFavorito = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('autohub_favoritos') || '[]');

        let nuevosFavs;
        if (favs.includes(id)) {
            nuevosFavs = favs.filter((favId: string) => favId !== id);
            setEsFavorito(false);
        } else {
            nuevosFavs = [...favs, id];
            setEsFavorito(true);
        }

        localStorage.setItem('autohub_favoritos', JSON.stringify(nuevosFavs));
        window.dispatchEvent(new Event('favoritosActualizados'));
    };

    const toggleComparador = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const comp = JSON.parse(localStorage.getItem('autohub_comparador') || '[]');

        let nuevosComp;
        if (comp.includes(id)) {
            nuevosComp = comp.filter((compId: string) => compId !== id);
            setEnComparador(false);
        } else {
            if (comp.length >= 3) {
                alert('Puedes comparar hasta 3 vehículos simultáneamente.');
                return;
            }
            nuevosComp = [...comp, id];
            setEnComparador(true);
        }

        localStorage.setItem('autohub_comparador', JSON.stringify(nuevosComp));
        window.dispatchEvent(new Event('comparadorActualizados'));
    };

    return (
        <Link href={`/catalogo/${id}`} className="group block h-full">
            <article className="bg-surface-secondary rounded-2xl overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-300 hover-lift h-full flex flex-col relative">
                {/* Botón Acciones Absolutas */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={toggleFavorito}
                        className="rounded-full bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/60 group/fav"
                        title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                        <Heart className={`w-4 h-4 transition-transform group-hover/fav:scale-110 ${esFavorito ? 'fill-accent text-accent' : 'text-white'}`} />
                    </Button>

                    <Button
                        variant={enComparador ? 'primary' : 'secondary'}
                        size="icon"
                        onClick={toggleComparador}
                        className={cn(
                            "rounded-full backdrop-blur-md border-white/10 group/comp",
                            !enComparador && "bg-black/40 hover:bg-black/60"
                        )}
                        title={enComparador ? 'Quitar del comparador' : 'Añadir a Comparar'}
                    >
                        <Scale className={`w-4 h-4 transition-transform group-hover/comp:scale-110 ${enComparador ? 'scale-110' : ''}`} />
                    </Button>
                </div>
                {/* Imagen */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    {badges && badges.length > 0 && (
                        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                            {badges.slice(0, 3).map((badge) => (
                                <span key={badge} className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-black/50 text-white border border-white/10">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    )}
                    <img
                        src={imagen_url}
                        alt={`${anio} ${marca} ${modelo}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-accent/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                            {anio}
                        </span>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                        {marca} {modelo}
                    </h3>
                    <p className="text-2xl font-black text-accent mt-1">
                        {formatearPrecio(precio)}
                    </p>

                    {/* Specs */}
                    <div className="mt-3 mb-4 flex flex-wrap items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5" />
                            {formatearKm(kilometraje)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Settings2 className="w-3.5 h-3.5" />
                            {transmision}
                        </span>
                        <span className="flex items-center gap-1">
                            <Fuel className="w-3.5 h-3.5" />
                            {combustible}
                        </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto">
                        <Button variant="secondary" className="w-full group-hover:bg-accent group-hover:text-white transition-all">
                            Ver Detalles y 360°
                        </Button>
                    </div>
                </div>
            </article>
        </Link>
    );
}
