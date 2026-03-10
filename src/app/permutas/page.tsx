'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
    User, Car, Camera, CheckCircle2, ChevronRight, ChevronLeft,
    Upload, X, Loader2, AlertCircle, PartyPopper
} from 'lucide-react';
import { validarFormatoVINBasico } from '@/lib/vin-validator';
import { insforge, isInsforgeConfigured } from '@/lib/insforge';

const PASOS = [
    { numero: 1, titulo: 'Tus datos', icono: User },
    { numero: 2, titulo: 'Tu vehículo', icono: Car },
    { numero: 3, titulo: 'Fotos', icono: Camera },
    { numero: 4, titulo: 'Confirmación', icono: CheckCircle2 },
];

const ESTADOS_VEHICULO = ['Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'Con detalles'];

interface FormData {
    nombre: string;
    email: string;
    telefono: string;
    vin: string;
    kilometraje: string;
    estado_vehiculo: string;
    marca: string;
    modelo: string;
    anio: string;
    comentarios: string;
}

const FORM_INICIAL: FormData = {
    nombre: '',
    email: '',
    telefono: '',
    vin: '',
    kilometraje: '',
    estado_vehiculo: '',
    marca: '',
    modelo: '',
    anio: '',
    comentarios: '',
};

export default function PermutasPage() {
    const [paso, setPaso] = useState(1);
    const [form, setForm] = useState<FormData>(FORM_INICIAL);
    const [fotos, setFotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    }

    function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (fotos.length + files.length > 6) {
            setError('Máximo 6 fotos permitidas');
            return;
        }
        const newFotos = [...fotos, ...files];
        const newPreviews = newFotos.map((f) => URL.createObjectURL(f));
        setFotos(newFotos);
        setPreviews(newPreviews);
    }

    function eliminarFoto(idx: number) {
        const newFotos = fotos.filter((_, i) => i !== idx);
        const newPreviews = newFotos.map((f) => URL.createObjectURL(f));
        setFotos(newFotos);
        setPreviews(newPreviews);
    }

    function validarPaso(): boolean {
        if (paso === 1) {
            if (!form.nombre || !form.email || !form.telefono) {
                setError('Completá todos los campos obligatorios');
                return false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                setError('Ingresá un email válido');
                return false;
            }
        }
        if (paso === 2) {
            if (!form.vin || !form.kilometraje || !form.estado_vehiculo) {
                setError('Completá todos los campos obligatorios');
                return false;
            }
            if (!validarFormatoVINBasico(form.vin)) {
                setError('El VIN debe tener 17 caracteres alfanuméricos (sin I, O, Q)');
                return false;
            }
        }
        return true;
    }

    function siguiente() {
        if (!validarPaso()) return;
        setError('');
        setPaso((prev) => Math.min(prev + 1, 4));
    }

    function anterior() {
        setError('');
        setPaso((prev) => Math.max(prev - 1, 1));
    }

    async function enviar() {
        setError('');
        if (!isInsforgeConfigured) {
            setDemoMode(true);
            setEnviado(true);
            return;
        }

        setEnviando(true);

        try {
            // Subir fotos a InsForge Storage
            const fotosUrls: string[] = [];
            for (const foto of fotos) {
                try {
                    const { data } = await insforge.storage
                        .from('vehicle-images')
                        .upload(`permutas/${Date.now()}-${foto.name}`, foto);

                    if (data?.key) {
                        const publicUrl = `${process.env.NEXT_PUBLIC_INSFORGE_BASE_URL}/storage/v1/object/public/vehicle-images/${data.key}`;
                        fotosUrls.push(publicUrl);
                    }
                } catch {
                    // Continuar sin foto si falla
                }
            }

            // Guardar en BD
            await insforge.database
                .from('trade_in_leads')
                .insert({
                    nombre: form.nombre,
                    email: form.email,
                    telefono: form.telefono,
                    vin: form.vin.toUpperCase(),
                    kilometraje: parseInt(form.kilometraje),
                    estado_vehiculo: form.estado_vehiculo,
                    marca: form.marca,
                    modelo: form.modelo,
                    anio: form.anio ? parseInt(form.anio) : null,
                    comentarios: form.comentarios,
                    fotos_urls: fotosUrls,
                    status: 'pendiente',
                });

            // Enviar a n8n webhook (via API route proxy)
            await fetch('/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: 'trade_in',
                    datos_usuario: {
                        nombre: form.nombre,
                        email: form.email,
                        telefono: form.telefono,
                    },
                    datos_vehiculo: {
                        vin: form.vin.toUpperCase(),
                        kilometraje: parseInt(form.kilometraje),
                        estado: form.estado_vehiculo,
                        marca: form.marca,
                        modelo: form.modelo,
                        anio: form.anio,
                    },
                    fotos_urls: fotosUrls,
                    timestamp: new Date().toISOString(),
                }),
            });

            setEnviado(true);
        } catch {
            setError('Hubo un error al enviar tu solicitud. Intentá de nuevo.');
        } finally {
            setEnviando(false);
        }
    }

    if (enviado) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PartyPopper className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">¡Solicitud Enviada!</h1>
                    <p className="text-muted leading-relaxed">
                        Recibimos tu solicitud de tasación. Nuestro equipo se comunicará con vos en menos de 24 horas con una oferta competitiva.
                    </p>
                    {demoMode && (
                        <p className="mt-3 text-xs text-amber-300/80">Modo demo: envío simulado.</p>
                    )}
                    <Link href="/" className="inline-block mt-8 px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-surface border-b border-white/5">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                        Tasación de <span className="text-accent">Permutas</span>
                    </h1>
                    <p className="mt-2 text-muted">Completá el formulario y recibí tu oferta en 24 horas</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-10">
                    {PASOS.map((p, idx) => (
                        <div key={p.numero} className="flex items-center">
                            <div className={`flex items-center gap-2 ${paso >= p.numero ? 'text-accent' : 'text-muted'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${paso > p.numero ? 'bg-accent border-accent text-white' :
                                    paso === p.numero ? 'border-accent bg-accent/10 text-accent' :
                                        'border-white/20 text-muted'
                                    }`}>
                                    {paso > p.numero ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <p.icono className="w-5 h-5" />
                                    )}
                                </div>
                                <span className="hidden sm:block text-sm font-medium">{p.titulo}</span>
                            </div>
                            {idx < PASOS.length - 1 && (
                                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${paso > p.numero ? 'bg-accent' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Formulario */}
                <div className="bg-surface-secondary rounded-2xl border border-white/5 p-6 sm:p-8">
                    {/* Paso 1: Datos personales */}
                    {paso === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-4">Tus datos de contacto</h2>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Nombre completo *</label>
                                <input
                                    name="nombre" value={form.nombre} onChange={handleChange}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Email *</label>
                                <input
                                    name="email" type="email" value={form.email} onChange={handleChange}
                                    placeholder="tu@email.com"
                                    className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Teléfono *</label>
                                <input
                                    name="telefono" type="tel" value={form.telefono} onChange={handleChange}
                                    placeholder="+598 99 123 456"
                                    className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Datos del vehículo */}
                    {paso === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-4">Datos de tu vehículo</h2>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">VIN (17 caracteres) *</label>
                                <input
                                    name="vin" value={form.vin} onChange={handleChange} maxLength={17}
                                    placeholder="Ej: 1HGBH41JXMN109186"
                                    className={`w-full px-4 py-3 bg-surface-tertiary border rounded-xl text-white placeholder-muted/50 focus:outline-none transition-colors uppercase ${form.vin && !validarFormatoVINBasico(form.vin) ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent/50'
                                        }`}
                                />
                                {form.vin && (
                                    <p className={`mt-1 text-xs ${validarFormatoVINBasico(form.vin) ? 'text-green-400' : 'text-red-400'}`}>
                                        {validarFormatoVINBasico(form.vin) ? '✓ Formato válido' : `✗ ${17 - form.vin.length} caracteres restantes`}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Marca</label>
                                    <input
                                        name="marca" value={form.marca} onChange={handleChange}
                                        placeholder="Ej: Toyota"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Modelo</label>
                                    <input
                                        name="modelo" value={form.modelo} onChange={handleChange}
                                        placeholder="Ej: Corolla"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Año</label>
                                    <input
                                        name="anio" type="number" value={form.anio} onChange={handleChange}
                                        placeholder="2020"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Kilometraje *</label>
                                    <input
                                        name="kilometraje" type="number" value={form.kilometraje} onChange={handleChange}
                                        placeholder="45000"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Estado general *</label>
                                <select
                                    name="estado_vehiculo" value={form.estado_vehiculo} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
                                >
                                    <option value="">Seleccioná el estado</option>
                                    {ESTADOS_VEHICULO.map((e) => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Comentarios</label>
                                <textarea
                                    name="comentarios" value={form.comentarios} onChange={handleChange}
                                    rows={3} placeholder="¿Algo más que quieras contarnos sobre tu vehículo?"
                                    className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Fotos */}
                    {paso === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-2">Fotos de tu vehículo</h2>
                            <p className="text-sm text-muted">Subí hasta 6 fotos (exterior, interior, detalles). Esto nos ayuda a darte una mejor valoración.</p>

                            {/* Upload area */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-10 border-2 border-dashed border-white/10 hover:border-accent/30 rounded-2xl flex flex-col items-center justify-center gap-3 text-muted hover:text-white transition-all"
                            >
                                <Upload className="w-10 h-10" />
                                <span className="text-sm font-medium">Hacé clic para subir fotos</span>
                                <span className="text-xs text-muted">{fotos.length}/6 fotos</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFotos}
                                className="hidden"
                            />

                            {/* Previews */}
                            {previews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {previews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => eliminarFoto(idx)}
                                                className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paso 4: Resumen */}
                    {paso === 4 && (
                        <div className="space-y-5 animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-4">Revisá tu información</h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-surface-tertiary rounded-xl">
                                    <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Datos personales</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-white"><span className="text-muted">Nombre:</span> {form.nombre}</p>
                                        <p className="text-white"><span className="text-muted">Email:</span> {form.email}</p>
                                        <p className="text-white"><span className="text-muted">Teléfono:</span> {form.telefono}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-surface-tertiary rounded-xl">
                                    <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Vehículo</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-white"><span className="text-muted">VIN:</span> {form.vin.toUpperCase()}</p>
                                        {form.marca && <p className="text-white"><span className="text-muted">Marca/Modelo:</span> {form.marca} {form.modelo}</p>}
                                        {form.anio && <p className="text-white"><span className="text-muted">Año:</span> {form.anio}</p>}
                                        <p className="text-white"><span className="text-muted">Kilometraje:</span> {parseInt(form.kilometraje).toLocaleString()} km</p>
                                        <p className="text-white"><span className="text-muted">Estado:</span> {form.estado_vehiculo}</p>
                                    </div>
                                </div>

                                {fotos.length > 0 && (
                                    <div className="p-4 bg-surface-tertiary rounded-xl">
                                        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Fotos ({fotos.length})</h3>
                                        <div className="flex gap-2 overflow-x-auto">
                                            {previews.map((src, idx) => (
                                                <img key={idx} src={src} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Botones de navegación */}
                <div className="flex justify-between mt-6">
                    {paso > 1 ? (
                        <button
                            onClick={anterior}
                            className="px-6 py-3 bg-surface-secondary hover:bg-surface-tertiary text-white font-semibold rounded-xl border border-white/10 flex items-center gap-2 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Anterior
                        </button>
                    ) : <div />}

                    {paso < 4 ? (
                        <button
                            onClick={siguiente}
                            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={enviar}
                            disabled={enviando}
                            className="px-8 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                        >
                            {enviando ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Enviar Solicitud
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
