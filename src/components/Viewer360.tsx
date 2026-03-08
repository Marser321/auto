'use client';

import { useRef, useMemo, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture, DeviceOrientationControls } from '@react-three/drei';
import * as THREE from 'three';
import { X, AlertTriangle, Star, Info, Gem, RotateCcw, Smartphone } from 'lucide-react';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
export interface Hotspot360 {
    id: string;
    yaw: number;    // Grados horizontales (0-360)
    pitch: number;  // Grados verticales (-90 a 90)
    titulo: string;
    descripcion: string;
    tipo: 'damage' | 'luxury' | 'feature' | 'material';
}

interface Viewer360Props {
    imagen: string;
    hotspots: Hotspot360[];
    hotspotActivo: string | null;
    onHotspotClick: (id: string | null) => void;
}

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

/** Convierte yaw/pitch (grados) a coordenadas 3D sobre una esfera */
function esferaACoordenadas(yaw: number, pitch: number, radio: number = 4.8): [number, number, number] {
    const phi = THREE.MathUtils.degToRad(90 - pitch);
    const theta = THREE.MathUtils.degToRad(yaw);
    return [
        -radio * Math.sin(phi) * Math.cos(theta),
        radio * Math.cos(phi),
        radio * Math.sin(phi) * Math.sin(theta),
    ];
}

function hotspotEstilo(tipo: string) {
    switch (tipo) {
        case 'damage': return { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-300', glow: 'shadow-yellow-500/40' };
        case 'luxury': return { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-300', glow: 'shadow-purple-500/40' };
        case 'material': return { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-300', glow: 'shadow-emerald-500/40' };
        default: return { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-300', glow: 'shadow-blue-500/40' };
    }
}

function HotspotIcono({ tipo }: { tipo: string }) {
    switch (tipo) {
        case 'damage': return <AlertTriangle className="w-3.5 h-3.5" />;
        case 'luxury': return <Star className="w-3.5 h-3.5" />;
        case 'material': return <Gem className="w-3.5 h-3.5" />;
        default: return <Info className="w-3.5 h-3.5" />;
    }
}

function tipoLabel(tipo: string) {
    switch (tipo) {
        case 'damage': return 'Detalle';
        case 'luxury': return 'Lujo';
        case 'material': return 'Material';
        default: return 'Característica';
    }
}

// ─────────────────────────────────────────────
// Esfera Panorámica
// ─────────────────────────────────────────────
function EsferaPanoramica({ imagen }: { imagen: string }) {
    // Drei's useTexture is Promise/Suspense based under the hood
    // Fallback if image string is missing or invalid
    const textureUrl = !imagen || imagen.trim() === '' ? '/360/car-interior-1.jpg' : imagen;

    const textura = useTexture(textureUrl);

    useMemo(() => {
        if (!textura) return;
        textura.colorSpace = THREE.SRGBColorSpace;
        textura.mapping = THREE.EquirectangularReflectionMapping;
    }, [textura]);

    if (!textura) return null;

    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[5, 64, 64]} />
            <meshBasicMaterial map={textura} side={THREE.BackSide} toneMapped={false} />
        </mesh>
    );
}

// ─────────────────────────────────────────────
// Marcador 3D (Hotspot)
// ─────────────────────────────────────────────
function Marcador3D({
    hotspot,
    activo,
    onClick,
}: {
    hotspot: Hotspot360;
    activo: boolean;
    onClick: () => void;
}) {
    const pos = useMemo(() => esferaACoordenadas(hotspot.yaw, hotspot.pitch), [hotspot.yaw, hotspot.pitch]);
    const estilo = hotspotEstilo(hotspot.tipo);
    const ref = useRef<THREE.Group>(null);
    const [pulso, setPulso] = useState(1);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        setPulso(1 + Math.sin(t * 2) * 0.15);
    });

    return (
        <group ref={ref} position={pos}>
            <Html center distanceFactor={8} zIndexRange={[10, 0]}>
                <div className="relative flex items-center justify-center">
                    {/* Anillo de pulso */}
                    <div
                        className={`absolute w-10 h-10 rounded-full ${estilo.bg} opacity-20`}
                        style={{ transform: `scale(${pulso})` }}
                    />

                    {/* Botón del marcador */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        className={`relative w-8 h-8 rounded-full border-2 ${estilo.bg} ${estilo.border} text-white flex items-center justify-center shadow-lg ${estilo.glow} transition-transform duration-200 cursor-pointer z-10 ${activo ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110'}`}
                    >
                        <HotspotIcono tipo={hotspot.tipo} />
                    </button>

                    {/* Tooltip al estar activo */}
                    {activo && (
                        <div className="absolute left-12 top-1/2 -translate-y-1/2 w-64 p-4 bg-black/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl animate-fade-in z-20">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="text-sm font-bold text-white leading-tight">{hotspot.titulo}</h4>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                                    className="text-white/40 hover:text-white flex-shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">{hotspot.descripcion}</p>
                            <span className={`inline-block mt-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${estilo.bg}/20 ${estilo.text}`}>
                                {tipoLabel(hotspot.tipo)}
                            </span>
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
}

// ─────────────────────────────────────────────
// Controles de cámara con auto-rotación
// ─────────────────────────────────────────────
function ControlesCamara({ autoRotar }: { autoRotar: boolean }) {
    const { camera, gl } = useThree();
    const isDragging = useRef(false);
    const prevMouse = useRef({ x: 0, y: 0 });
    const rotacion = useRef({ phi: Math.PI / 2, theta: 0 });
    const velocidad = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = gl.domElement;

        function onPointerDown(e: PointerEvent) {
            isDragging.current = true;
            prevMouse.current = { x: e.clientX, y: e.clientY };
            velocidad.current = { x: 0, y: 0 };
            canvas.style.cursor = 'grabbing';
        }

        function onPointerMove(e: PointerEvent) {
            if (!isDragging.current) return;
            const dx = (e.clientX - prevMouse.current.x) * 0.003;
            const dy = (e.clientY - prevMouse.current.y) * 0.003;
            rotacion.current.theta -= dx;
            rotacion.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, rotacion.current.phi - dy));
            velocidad.current = { x: dx, y: dy };
            prevMouse.current = { x: e.clientX, y: e.clientY };
        }

        function onPointerUp() {
            isDragging.current = false;
            canvas.style.cursor = 'grab';
        }

        // Touch
        function onTouchStart(e: TouchEvent) {
            if (e.touches.length === 1) {
                isDragging.current = true;
                prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                velocidad.current = { x: 0, y: 0 };
            }
        }

        function onTouchMove(e: TouchEvent) {
            if (!isDragging.current || e.touches.length !== 1) return;
            const dx = (e.touches[0].clientX - prevMouse.current.x) * 0.003;
            const dy = (e.touches[0].clientY - prevMouse.current.y) * 0.003;
            rotacion.current.theta -= dx;
            rotacion.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, rotacion.current.phi - dy));
            velocidad.current = { x: dx, y: dy };
            prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }

        function onTouchEnd() {
            isDragging.current = false;
        }

        canvas.style.cursor = 'grab';
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointerleave', onPointerUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
        canvas.addEventListener('touchend', onTouchEnd);

        return () => {
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointerleave', onPointerUp);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', onTouchEnd);
        };
    }, [gl]);

    useFrame(() => {
        // Auto-rotación suave
        if (autoRotar && !isDragging.current) {
            rotacion.current.theta += 0.0008;
        }

        // Inercia
        if (!isDragging.current) {
            velocidad.current.x *= 0.95;
            velocidad.current.y *= 0.95;
            rotacion.current.theta -= velocidad.current.x;
            rotacion.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, rotacion.current.phi - velocidad.current.y));
        }

        // Actualizar cámara
        const { phi, theta } = rotacion.current;
        camera.position.set(0, 0, 0);
        camera.lookAt(
            -Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta)
        );
    });

    return null;
}

// ─────────────────────────────────────────────
// Componente Principal Exportado
// ─────────────────────────────────────────────
export default function Viewer360({ imagen, hotspots, hotspotActivo, onHotspotClick }: Viewer360Props) {
    const [cargando, setCargando] = useState(true);
    const [autoRotar, setAutoRotar] = useState(true);
    const [arEnabled, setArEnabled] = useState(false);
    const [montado, setMontado] = useState(false);

    useEffect(() => {
        setMontado(true);
    }, []);

    // Función para solicitar permisos de dispositivo orientacion en iOS 13+
    const toggleAR = useCallback(async () => {
        if (arEnabled) {
            setArEnabled(false);
            return;
        }

        // Si es un dispositivo que soporta Device Orientation Event y necesita Permisos
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    setAutoRotar(false);
                    setArEnabled(true);
                } else {
                    alert('Se necesita permiso para usar la Realidad Aumentada.');
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            // Android o navegadores no restrictivos
            setAutoRotar(false);
            setArEnabled(true);
        }
    }, [arEnabled]);

    if (!montado) return null;

    return (
        <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
            {/* Indicador de carga */}
            {cargando && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black gap-3">
                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-white/60">Cargando vista 360°...</p>
                </div>
            )}

            {/* Canvas Three.js */}
            <Canvas
                camera={{ fov: 75, near: 0.1, far: 100, position: [0, 0, 0.01] }}
                onCreated={() => setTimeout(() => setCargando(false), 500)}
                className="!touch-none"
            >
                {/* Controles de Cámara (Mouse o Giroscopio) */}
                {arEnabled ? (
                    <DeviceOrientationControls />
                ) : (
                    <ControlesCamara autoRotar={autoRotar} />
                )}

                <Suspense fallback={null}>
                    <EsferaPanoramica imagen={imagen} />
                </Suspense>

                {/* Hotspots 3D */}
                {hotspots.map((hs) => (
                    <Marcador3D
                        key={hs.id}
                        hotspot={hs}
                        activo={hotspotActivo === hs.id}
                        onClick={() => {
                            if (!arEnabled) setAutoRotar(false);
                            onHotspotClick(hotspotActivo === hs.id ? null : hs.id);
                        }}
                    />
                ))}
            </Canvas>

            {/* Controles UI overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
                <button
                    onClick={() => {
                        if (arEnabled) setArEnabled(false);
                        setAutoRotar(!autoRotar);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${autoRotar && !arEnabled
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-white/10 text-white/60 border border-white/10 hover:text-white'
                        }`}
                >
                    <RotateCcw className={`w-3.5 h-3.5 ${autoRotar && !arEnabled ? 'animate-spin' : ''}`} style={autoRotar && !arEnabled ? { animationDuration: '3s' } : {}} />
                    Auto-rotar
                </button>

                {/* Botón de Giroscopio */}
                <button
                    onClick={toggleAR}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hidden sm:flex ${arEnabled
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 ring-2 ring-blue-500/20'
                        : 'bg-white/10 text-white/60 border border-white/10 hover:text-white'
                        }`}
                    title="Mueve tu dispositivo para explorar"
                >
                    <Smartphone className={`w-3.5 h-3.5 ${arEnabled ? 'animate-pulse' : ''}`} />
                    Modo AR {arEnabled ? 'Activado' : ''}
                </button>
            </div>

            {/* Hint de interacción */}
            <div className="absolute bottom-4 right-4 z-20 px-3 py-2 bg-black/40 backdrop-blur-sm text-white/40 text-xs rounded-lg pointer-events-none hidden sm:block">
                {arEnabled ? 'Girón el celular para explorar' : 'Arrastrá para explorar • Click en marcadores'}
            </div>
        </div>
    );
}
