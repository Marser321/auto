'use client';
/* eslint-disable @next/next/no-img-element */

import { Camera, Eye, Film, CheckCircle2, ArrowRight, Play, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

const SERVICIOS_PREMIUM = [
    {
        id: 'fotos',
        icono: Camera,
        titulo: 'Fotografía Profesional',
        subtitulo: 'Sesiones de estudio y exteriores',
        descripcion: 'Capturamos cada ángulo de tu vehículo con iluminación controlada y edición de nivel publicitario. Resaltamos los detalles que venden.',
        puntos: ['Resolución 4K', 'Edición avanzada (Color Grading)', 'Remoción de patentes y reflejos', 'Entrega en 24hs'],
        imagen: '/demo/services/showroom.jpg',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    },
    {
        id: '360',
        icono: Eye,
        titulo: 'Tour Interior 360°',
        subtitulo: 'Experiencia inmersiva interactiva',
        descripcion: 'Permití que tus clientes se suban al auto desde su celular. Un visor interactivo que elimina dudas y aumenta el deseo de compra.',
        puntos: ['Integración nativa WebGL', 'Hotspots de equipamiento', 'Compatible con VR', 'Visualización fluida'],
        imagen: '/demo/services/interior.jpg',
        color: 'text-accent',
        bg: 'bg-accent/10'
    },
    {
        id: 'reels',
        icono: Film,
        titulo: 'Video Reels & Short-form',
        subtitulo: 'Viralidad para Instagram y TikTok',
        descripcion: 'Creamos videos dinámicos con música tendencia y transiciones impactantes. La mejor forma de conseguir interesados frescos via redes sociales.',
        puntos: ['Formato 9:16 vertical', 'Música licenciada', 'Edición de ritmo rápido', 'Optimizado para algoritmos'],
        imagen: '/demo/services/workshop.jpg',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10'
    }
];

export default function ServiciosPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Hero Section */}
            <section className="relative py-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-xs text-white font-bold uppercase tracking-widest">Servicios VIP para Agencias</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-8 animate-slide-up">
                        Transformamos tu stock<br />
                        en una <span className="text-gradient">experiencia digital</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto mb-12 animate-slide-up animation-delay-100">
                        No solo sacamos fotos; creamos contenido que detiene el scroll y acelera la venta.
                        Tecnología 360°, video cinemático y fotografía de alta gama.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-200">
                        <Link href="/contacto" className="w-full sm:w-auto px-10 py-5 bg-accent hover:bg-accent-hover text-white font-black rounded-2xl shadow-xl shadow-accent/20 transition-all hover:scale-105">
                            Quiero una demo
                        </Link>
                        <a href="#servicios" className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                            Ver servicios
                        </a>
                    </div>
                </div>
            </section>

            {/* Grid de Servicios */}
            <section id="servicios" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 gap-16">
                        {SERVICIOS_PREMIUM.map((s, i) => (
                            <div key={s.id} className={`flex flex-col lg:items-center gap-12 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                                <div className="flex-1 space-y-6">
                                    <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center`}>
                                        <s.icono className={`w-7 h-7 ${s.color}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">{s.titulo}</h2>
                                        <p className={`text-lg font-bold ${s.color}`}>{s.subtitulo}</p>
                                    </div>
                                    <p className="text-lg text-muted leading-relaxed">
                                        {s.descripcion}
                                    </p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {s.puntos.map(p => (
                                            <li key={p} className="flex items-center gap-3 text-white/80">
                                                <CheckCircle2 className={`w-5 h-5 ${s.color}`} />
                                                <span className="text-sm font-medium">{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex-1 relative group">
                                    <div className="absolute -inset-4 bg-gradient-to-tr from-accent/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
                                        <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Valores / Confianza */}
            <section className="py-24 bg-surface relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {[
                            { icono: Zap, titulo: 'Velocidad', desc: 'Edición y entrega en menos de 24 horas hábiles.' },
                            { icono: Shield, titulo: 'Calidad', desc: 'Equipamiento de cine y post-producción profesional.' },
                            { icono: Play, titulo: 'Visibilidad', desc: 'Multiplicá x5 tus consultas comparado con fotos de celular.' }
                        ].map(item => (
                            <div key={item.titulo} className="p-8 bg-surface-secondary rounded-3xl border border-white/5">
                                <item.icono className="w-10 h-10 text-accent mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{item.titulo}</h3>
                                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-4 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 blur-[150px] rounded-full" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">
                        ¿Listo para llevar tu agencia al <span className="text-gradient">siguiente nivel?</span>
                    </h2>
                    <p className="text-xl text-muted mb-12">
                        Dejanos tus datos y coordinamos una visita a tu salón para una prueba gratuita.
                    </p>
                    <Link href="/contacto" className="inline-flex items-center gap-3 px-12 py-6 bg-accent hover:bg-accent-hover text-white text-xl font-black rounded-2xl shadow-2xl shadow-accent/40 transition-all hover:scale-110 group">
                        Empezar Ahora
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
