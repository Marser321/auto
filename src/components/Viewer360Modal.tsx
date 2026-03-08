'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import type { Hotspot360 } from './Viewer360';

// Importar Viewer360 dinámicamente (Three.js no soporta SSR)
const Viewer360 = dynamic(() => import('./Viewer360'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

interface Viewer360ModalProps {
    visible: boolean;
    onCerrar: () => void;
    imagen: string;
    hotspots: Hotspot360[];
    titulo?: string;
}

export default function Viewer360Modal({
    visible,
    onCerrar,
    imagen,
    hotspots,
    titulo = 'Tour Interior 360°',
}: Viewer360ModalProps) {
    const [hotspotActivo, setHotspotActivo] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);

    if (!visible) return null;

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => { });
        } else {
            document.exitFullscreen().then(() => setFullscreen(false)).catch(() => { });
        }
    }

    const hotspotSeleccionado = hotspots.find((h) => h.id === hotspotActivo);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/60 border-b border-white/5 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Move className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-white">{titulo}</h2>
                        <p className="text-[11px] text-white/40 hidden sm:block">
                            {hotspots.length} puntos de interés • Arrastrá para rotar
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleFullscreen}
                        className="w-9 h-9 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                        {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onCerrar}
                        className="w-9 h-9 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Visor 360° */}
                <div className="flex-1 relative">
                    <Viewer360
                        imagen={imagen}
                        hotspots={hotspots}
                        hotspotActivo={hotspotActivo}
                        onHotspotClick={setHotspotActivo}
                    />
                </div>

                {/* Panel lateral de hotspots */}
                <div className="w-full lg:w-80 bg-surface/80 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                            Puntos de Interés ({hotspots.length})
                        </h3>
                        <div className="space-y-2">
                            {hotspots.map((hs) => {
                                const activo = hotspotActivo === hs.id;
                                return (
                                    <button
                                        key={hs.id}
                                        onClick={() => setHotspotActivo(activo ? null : hs.id)}
                                        className={`w-full text-left p-3 rounded-xl transition-all ${activo
                                                ? 'bg-accent/10 border border-accent/30 ring-1 ring-accent/20'
                                                : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white ${hs.tipo === 'damage'
                                                        ? 'bg-yellow-500/20'
                                                        : hs.tipo === 'luxury'
                                                            ? 'bg-purple-500/20'
                                                            : hs.tipo === 'material'
                                                                ? 'bg-emerald-500/20'
                                                                : 'bg-blue-500/20'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold">
                                                    {hs.tipo === 'damage' ? '⚠' : hs.tipo === 'luxury' ? '★' : hs.tipo === 'material' ? '◆' : 'ℹ'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${activo ? 'text-accent' : 'text-white'}`}>
                                                    {hs.titulo}
                                                </p>
                                                <p className="text-xs text-white/40 line-clamp-2 mt-0.5">{hs.descripcion}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detalle expandido */}
                    {hotspotSeleccionado && (
                        <div className="p-4 border-t border-white/5 animate-fade-in">
                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                                <h4 className="text-sm font-bold text-white mb-1">{hotspotSeleccionado.titulo}</h4>
                                <p className="text-xs text-white/60 leading-relaxed">{hotspotSeleccionado.descripcion}</p>
                                <span
                                    className={`inline-block mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${hotspotSeleccionado.tipo === 'damage'
                                            ? 'bg-yellow-500/20 text-yellow-300'
                                            : hotspotSeleccionado.tipo === 'luxury'
                                                ? 'bg-purple-500/20 text-purple-300'
                                                : hotspotSeleccionado.tipo === 'material'
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : 'bg-blue-500/20 text-blue-300'
                                        }`}
                                >
                                    {hotspotSeleccionado.tipo === 'damage'
                                        ? 'Detalle / Imperfección'
                                        : hotspotSeleccionado.tipo === 'luxury'
                                            ? 'Equipamiento de Lujo'
                                            : hotspotSeleccionado.tipo === 'material'
                                                ? 'Material Premium'
                                                : 'Característica'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
