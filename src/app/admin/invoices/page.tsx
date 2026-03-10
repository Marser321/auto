'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, DollarSign, ArrowLeft, Loader2, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

interface Invoice {
    id: string;
    numero_factura: number;
    fecha: string;
    total: number;
    moneda: string;
    estado_pago: string;
    customer_id: string;
    customer: { nombre: string; apellido: string };
}

export default function InvoicesAdminPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customers, setCustomers] = useState<{ id: string, nombre: string, apellido: string }[]>([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        total: 0,
        moneda: 'USD',
        estado_pago: 'pendiente'
    });

    useEffect(() => {
        loadInvoices();
        loadCustomers();
    }, []);

    async function loadCustomers() {
        try {
            const { data } = await insforge.database.from('customers').select('id, nombre, apellido');
            if (data) setCustomers(data);
        } catch (err) {
            console.error('Error loading customers for invoices:', err);
        }
    }

    async function loadInvoices() {
        setLoading(true);
        try {
            const { data, error } = await insforge.database
                .from('invoices')
                .select(`
                    *,
                    customer:customers(nombre, apellido)
                `)
                .order('fecha', { ascending: false });

            if (error) throw error;
            setInvoices(data || []);
        } catch (err) {
            console.error('Error loading invoices:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Generar número de factura simple
            const nextNum = invoices.length > 0 ? Math.max(...invoices.map(i => i.numero_factura)) + 1 : 1001;

            const { error } = await insforge.database
                .from('invoices')
                .insert([{
                    ...formData,
                    numero_factura: nextNum,
                    fecha: new Date().toISOString()
                }]);

            if (error) throw error;
            setShowModal(false);
            setFormData({ customer_id: '', total: 0, moneda: 'USD', estado_pago: 'pendiente' });
            loadInvoices();
        } catch {
            alert('Error al crear factura');
        } finally {
            setSaving(false);
        }
    };

    const deleteInvoice = async (id: string) => {
        if (!confirm('¿Eliminar factura?')) return;
        try {
            const { error } = await insforge.database.from('invoices').delete().eq('id', id);
            if (error) throw error;
            loadInvoices();
        } catch {
            alert('Error al eliminar');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pagado': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pendiente': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'anulado': return 'bg-red-500/10 text-red-400 border-red-500/20';
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
                                <h1 className="text-2xl font-bold text-white">Facturación y <span className="text-accent">Pagos</span></h1>
                                <p className="text-xs text-muted">Registro oficial de transacciones</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-surface-secondary hover:bg-surface-tertiary border border-white/10 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Exportar
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-accent/20"
                            >
                                Nueva Factura Manual
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-surface border border-white/5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-12 h-12 text-accent" />
                        </div>
                        <p className="text-xs text-muted uppercase font-bold tracking-wider">Ingresos Totales (Mes)</p>
                        <p className="text-3xl font-black text-white mt-1">USD {invoices.reduce((acc, inv) => acc + (inv.estado_pago === 'pagado' ? Number(inv.total) : 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-surface border border-white/5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Clock className="w-12 h-12 text-yellow-400" />
                        </div>
                        <p className="text-xs text-muted uppercase font-bold tracking-wider">Pendiente de Cobro</p>
                        <p className="text-3xl font-black text-yellow-400 mt-1">USD {invoices.reduce((acc, inv) => acc + (inv.estado_pago === 'pendiente' ? Number(inv.total) : 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-surface border border-white/5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </div>
                        <p className="text-xs text-muted uppercase font-bold tracking-wider">Facturas Emitidas</p>
                        <p className="text-3xl font-black text-white mt-1">{invoices.length}</p>
                    </div>
                </div>

                {/* Listado de Facturas */}
                <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Factura / Fecha</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Total</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8 bg-white/[0.01]" />
                                        </tr>
                                    ))
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted">
                                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                            <p>No se encontraron facturas registradas.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-accent">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">FAC-{inv.numero_factura.toString().padStart(5, '0')}</p>
                                                        <p className="text-[10px] text-muted">{new Date(inv.fecha).toLocaleDateString('es-UY')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-white font-medium">
                                                    {inv.customer?.nombre} {inv.customer?.apellido}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] uppercase font-black rounded-md border ${getStatusStyle(inv.estado_pago)}`}>
                                                    {inv.estado_pago}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-white">{inv.moneda} {inv.total?.toLocaleString() || '0'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => deleteInvoice(inv.id)}
                                                    className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Nueva Factura */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden animate-scale-in shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Nueva <span className="text-accent">Factura</span></h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Seleccionar Cliente</label>
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
                                    <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Monto Total</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.total}
                                        onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-bold uppercase tracking-wider ml-1">Estado</label>
                                    <select
                                        value={formData.estado_pago}
                                        onChange={(e) => setFormData({ ...formData, estado_pago: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="pagado">Pagado</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Registrar Factura'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
