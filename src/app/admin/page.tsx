'use client';

import { useState, useEffect } from 'react';
import {
    Car, Users, RefreshCcw, Plus,
    Wrench, FileText, ChevronRight, TrendingUp, AlertCircle,
    CheckCircle2, Clock
} from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

interface DashboardStats {
    vehiculos: number;
    clientes: number;
    taller: number;
    facturacion: number;
}

type InvoiceTotalRow = { total: number | string | null };

export default function AdminPage() {
    const [stats, setStats] = useState<DashboardStats>({
        vehiculos: 0,
        clientes: 0,
        taller: 0,
        facturacion: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {
        setLoading(true);
        try {
            const [vehiculos, clientes, taller, facturas] = await Promise.all([
                insforge.database.from('vehicle_inventory').select('id', { count: 'exact' }),
                insforge.database.from('customers').select('id', { count: 'exact' }),
                insforge.database.from('workshop_orders').select('id', { count: 'exact' }),
                insforge.database.from('invoices').select('total'),
            ]);

            const facturaRows = (facturas.data ?? []) as InvoiceTotalRow[];

            setStats({
                vehiculos: vehiculos.count || 0,
                clientes: clientes.count || 0,
                taller: taller.count || 0,
                facturacion: facturaRows.reduce((acc, inv) => acc + Number(inv.total ?? 0), 0),
            });
        } catch (err) {
            console.error('Error cargando stats:', err);
        } finally {
            setLoading(false);
        }
    }

    const MENU_CARDS = [
        {
            title: 'Inventario de Vehículos',
            desc: 'Gestionar stock, precios y multimedia.',
            icon: Car,
            link: '/admin/vehicles',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            stats: `${stats.vehiculos} unidades`
        },
        {
            title: 'Clientes (CRM)',
            desc: 'Administrar base de datos de clientes.',
            icon: Users,
            link: '/admin/customers',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            stats: `${stats.clientes} clientes`
        },
        {
            title: 'Taller & Services',
            desc: 'Seguimiento de reparaciones y mantenimientos.',
            icon: Wrench,
            link: '/admin/workshop',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            stats: `${stats.taller} órdenes`
        },
        {
            title: 'Facturación & Pagos',
            desc: 'Control de cobros y facturas emitidas.',
            icon: FileText,
            link: '/admin/invoices',
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            stats: `USD ${stats.facturacion.toLocaleString()}`
        },
    ];

    return (
        <div className="min-h-screen bg-surface-secondary/30">
            {/* Header / Hero Section */}
            <div className="bg-surface border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                Central de <span className="text-accent underline decoration-accent/30 underline-offset-8">Operaciones</span>
                            </h1>
                            <p className="text-muted mt-2 text-lg">Bienvenido al núcleo de gestión de AutoHub.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={cargarDatos}
                                className="px-6 py-3 bg-surface-secondary hover:bg-surface-tertiary border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center gap-2"
                            >
                                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar Panel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Sección de Navegación Rápida */}
                <h2 className="text-sm font-black text-muted uppercase tracking-[0.2em] mb-6">Módulos Administrativos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {MENU_CARDS.map((card) => (
                        <Link
                            key={card.title}
                            href={card.link}
                            className="group p-6 bg-surface border border-white/5 rounded-3xl hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/5 transition-all relative overflow-hidden"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                            <p className="text-sm text-muted mb-6 leading-relaxed">{card.desc}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className={`text-xs font-black uppercase tracking-wider ${card.color}`}>
                                    {loading ? '...' : card.stats}
                                </span>
                                <ChevronRight className="w-4 h-4 text-muted group-hover:text-white transition-colors group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Actividad Reciente / Notificaciones */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-8 bg-surface border border-white/5 rounded-3xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-accent" />
                                    Actividad del Negocio
                                </h3>
                                <button className="text-xs text-accent font-bold hover:underline">Ver reporte completo</button>
                            </div>

                            {/* Placeholder para un gráfico o lista de actividad real */}
                            <div className="space-y-4">
                                {[
                                    { icon: Plus, text: "Nuevo vehículo ingresado al stock: VW Golf GTI", time: "Hace 2 horas", type: "stock" },
                                    { icon: Users, text: "Nuevo cliente registrado satisfactoriamente", time: "Hace 5 horas", type: "crm" },
                                    { icon: CheckCircle2, text: "Service completado y listo para entrega", time: "Hace 1 día", type: "workshop" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-surface-secondary/50 border border-white/5 rounded-2xl">
                                        <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-muted">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium">{item.text}</p>
                                            <p className="text-[10px] text-muted">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Alertas y Estado Global */}
                    <div className="space-y-6">
                        <div className="p-8 bg-surface border border-white/5 rounded-3xl">
                            <h3 className="text-xl font-bold text-white mb-6">Estado del Taller</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted">Capacidad Operativa</span>
                                        <span className="text-sm text-white font-bold">75%</span>
                                    </div>
                                    <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-accent w-3/4 rounded-full" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface-secondary/50 border border-white/5 rounded-xl text-center">
                                        <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto mb-2" />
                                        <p className="text-[10px] text-muted uppercase font-bold tracking-tighter">Retrasados</p>
                                        <p className="text-xl font-black text-white">2</p>
                                    </div>
                                    <div className="p-4 bg-surface-secondary/50 border border-white/5 rounded-xl text-center">
                                        <Clock className="w-4 h-4 text-blue-400 mx-auto mb-2" />
                                        <p className="text-[10px] text-muted uppercase font-bold tracking-tighter">Próx. Salida</p>
                                        <p className="text-xl font-black text-white">Hoy</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Banner Publicitario Interno / Atajo */}
                        <div className="p-8 bg-accent rounded-3xl relative overflow-hidden group cursor-pointer">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform" />
                            <h3 className="text-xl font-black text-white relative z-10">Nueva Venta</h3>
                            <p className="text-white/80 text-sm mt-2 relative z-10">Registrar una nueva venta y generar factura automáticamente.</p>
                            <div className="mt-6 inline-flex items-center justify-center w-10 h-10 bg-white text-accent rounded-xl shadow-lg relative z-10">
                                <Plus className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
