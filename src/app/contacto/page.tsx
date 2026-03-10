'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { insforge, isInsforgeConfigured } from '@/lib/insforge';

export default function ContactoPage() {
    const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '', vehiculo_interes: '' });
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.nombre || !form.email || !form.mensaje) {
            setError('Completá los campos obligatorios');
            return;
        }

        if (!isInsforgeConfigured) {
            setDemoMode(true);
            setEnviado(true);
            return;
        }

        setEnviando(true);
        try {
            await insforge.database.from('contact_leads').insert({
                nombre: form.nombre,
                email: form.email,
                telefono: form.telefono,
                mensaje: form.mensaje,
                vehiculo_interes: form.vehiculo_interes || null,
                status: 'nuevo',
            });

            // También enviar a n8n
            await fetch('/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo: 'contacto', ...form, timestamp: new Date().toISOString() }),
            });

            setEnviado(true);
        } catch {
            setError('Error al enviar. Intentá de nuevo.');
        } finally {
            setEnviando(false);
        }
    }

    if (enviado) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">¡Mensaje Enviado!</h1>
                    <p className="text-muted">Te responderemos lo antes posible.</p>
                    {demoMode && (
                        <p className="mt-3 text-xs text-amber-300/80">Modo demo: envío simulado.</p>
                    )}
                    <a href="/" className="inline-block mt-6 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors">
                        Volver al inicio
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="bg-surface border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                        <span className="text-accent">Contactanos</span>
                    </h1>
                    <p className="mt-2 text-muted">Estamos para ayudarte. Escribinos y te respondemos rápido.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-surface-secondary rounded-2xl border border-white/5 p-6 sm:p-8 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">{error}</div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Nombre *</label>
                                    <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Email *</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Teléfono</label>
                                    <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="+598 99 123 456"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Vehículo de interés</label>
                                    <input name="vehiculo_interes" value={form.vehiculo_interes} onChange={handleChange} placeholder="Ej: Mercedes C300"
                                        className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Mensaje *</label>
                                <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={4} placeholder="¿En qué podemos ayudarte?"
                                    className="w-full px-4 py-3 bg-surface-tertiary border border-white/10 rounded-xl text-white placeholder-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-none" />
                            </div>
                            <button type="submit" disabled={enviando}
                                className="w-full py-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                {enviando ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : <><Send className="w-5 h-5" /> Enviar Mensaje</>}
                            </button>
                        </form>
                    </div>

                    {/* Info de contacto */}
                    <div className="space-y-4">
                        {[
                            { icono: MapPin, titulo: 'Dirección', texto: 'Av. Italia 1234, Montevideo, Uruguay' },
                            { icono: Phone, titulo: 'Teléfono', texto: '+598 99 123 456' },
                            { icono: Mail, titulo: 'Email', texto: 'info@autohub.com.uy' },
                            { icono: Clock, titulo: 'Horario', texto: 'Lun-Vie 9:00-18:00\nSáb 9:00-13:00' },
                        ].map((item) => (
                            <div key={item.titulo} className="p-4 bg-surface-secondary rounded-xl border border-white/5 flex items-start gap-4">
                                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <item.icono className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{item.titulo}</h3>
                                    <p className="text-sm text-muted whitespace-pre-line">{item.texto}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
