'use client';

import { useState, useEffect } from 'react';
import { Plus, Wrench, Clock, User, Car, ArrowLeft, Loader2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

interface WorkshopOrder {
    id: string;
    vehicle_id: string;
    customer_id: string;
    fecha_entrada: string;
    estado: string;
    descripcion_problema: string;
    costo_total: number;
    vehicle: { marca: string; modelo: string };
    customer: { nombre: string; apellido: string };
}

export default function WorkshopAdminPage() {
    const [orders, setOrders] = useState<WorkshopOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [vehicles, setVehicles] = useState<{ id: string, marca: string, modelo: string }[]>([]);
    const [customers, setCustomers] = useState<{ id: string, nombre: string, apellido: string }[]>([]);

    const [formData, setFormData] = useState({
        vehicle_id: '',
        customer_id: '',
        descripcion_problema: '',
        kilometraje_entrada: 0,
        estado: 'pendiente'
    });

    useEffect(() => {
        loadOrders();
        loadFormData();
    }, []);

    async function loadFormData() {
        const [vRes, cRes] = await Promise.all([
            insforge.database.from('vehicle_inventory').select('id, marca, modelo'),
            insforge.database.from('customers').select('id, nombre, apellido')
        ]);
        if (vRes.data) setVehicles(vRes.data);
        if (cRes.data) setCustomers(cRes.data);
    }

    async function loadOrders() {
        setLoading(true);
        try {
            const { data, error } = await insforge.database
                .from('workshop_orders')
                .select(`
                    *,
                    vehicle:vehicle_inventory(marca, modelo),
                    customer:customers(nombre, apellido)
                `)
                .order('fecha_entrada', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error loading workshop orders:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await insforge.database
                .from('workshop_orders')
                .insert([formData]);

            if (error) throw error;

            setShowModal(false);
            setFormData({ vehicle_id: '', customer_id: '', descripcion_problema: '', kilometraje_entrada: 0, estado: 'pendiente' });
            loadOrders();
        } catch (err) {
            alert('Error al crear orden');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendiente': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'en_progreso': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'completado': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'entregado': return 'bg-white/5 text-muted border-white/10';
            default: return 'bg-white/5 text-muted';
        }
    };

    return (
        <div className="min-h-screen bg-surface-secondary/30">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="p-2 hover:bg-white/5 rounded-xl text-muted hover:text-white transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Gestión de <span className="text-accent">Taller</span></h1>
                                <p className="text-xs text-muted">Service, mantenimientos y reparaciones</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/20"
                        >
                            <Plus className="w-5 h-5" />
                            Nueva Orden
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-surface border border-white/5 rounded-2xl">
                        <p className="text-[10px] text-muted uppercase font-bold tracking-wider">En Taller</p>
                        <p className="text-2xl font-black text-white mt-1">{orders.filter(o => o.estado !== 'entregado').length}</p>
                    </div>
                    <div className="p-4 bg-surface border border-white/5 rounded-2xl">
                        <p className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">Pendientes</p>
                        <p className="text-2xl font-black text-white mt-1">{orders.filter(o => o.estado === 'pendiente').length}</p>
                    </div>
                    <div className="p-4 bg-surface border border-white/5 rounded-2xl">
                        <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">En Progreso</p>
                        <p className="text-2xl font-black text-white mt-1">{orders.filter(o => o.estado === 'en_progreso').length}</p>
                    </div>
                    <div className="p-4 bg-surface border border-white/5 rounded-2xl">
                        <p className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Listos</p>
                        <p className="text-2xl font-black text-white mt-1">{orders.filter(o => o.estado === 'completado').length}</p>
                    </div>
                </div>

                {/* Listado de Órdenes */}
                <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Orden / Fecha</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Costo</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-8 bg-white/[0.01]" />
                                        </tr>
                                    ))
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted">
                                            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                            <p>No hay órdenes de taller activas.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-muted">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">#{order.id.slice(0, 5).toUpperCase()}</p>
                                                        <p className="text-[10px] text-muted">{new Date(order.fecha_entrada).toLocaleDateString('es-UY')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Car className="w-3.5 h-3.5 text-accent" />
                                                    <span className="text-sm text-white font-medium">
                                                        {order.vehicle?.marca} {order.vehicle?.modelo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-muted" />
                                                    <span className="text-sm text-muted">
                                                        {order.customer?.nombre} {order.customer?.apellido}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] uppercase font-black rounded-md border ${getStatusColor(order.estado)}`}>
                                                    {order.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-white">USD {order.costo_total?.toLocaleString() || '0'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Nueva Orden */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Nueva <span className="text-accent">Orden de Taller</span></h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-white transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Vehículo del Inventario</label>
                                <select
                                    required
                                    value={formData.vehicle_id}
                                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 appearance-none"
                                >
                                    <option value="">Seleccionar vehículo...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.marca} {v.modelo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Cliente</label>
                                <select
                                    required
                                    value={formData.customer_id}
                                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 appearance-none"
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Km de Entrada</label>
                                    <input
                                        type="number"
                                        value={formData.kilometraje_entrada}
                                        onChange={(e) => setFormData({ ...formData, kilometraje_entrada: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Estado Inicial</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_progreso">En Progreso</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Descripción del Problema</label>
                                <textarea
                                    required
                                    value={formData.descripcion_problema}
                                    onChange={(e) => setFormData({ ...formData, descripcion_problema: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white resize-none"
                                    placeholder="Describa el problema o service requerido..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Registrar Orden de Taller'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
