'use client';

import { useState, useEffect, type SVGProps } from 'react';
import { Plus, Search, User, Phone, Mail, Edit2, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

interface Customer {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    documento: string;
    direccion?: string;
    created_at: string;
}

export default function CustomersAdminPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        documento: '',
        direccion: '',
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        setLoading(true);
        try {
            const { data, error } = await insforge.database
                .from('customers')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            console.error('Error loading customers:', err);
        } finally {
            setLoading(false);
        }
    }

    const openEditModal = (customer: Customer) => {
        setEditingId(customer.id);
        setFormData({
            nombre: customer.nombre,
            apellido: customer.apellido,
            email: customer.email,
            telefono: customer.telefono,
            documento: customer.documento,
            direccion: customer.direccion || '',
        });
        setShowModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                const { error } = await insforge.database
                    .from('customers')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await insforge.database
                    .from('customers')
                    .insert([formData]);
                if (error) throw error;
            }

            setShowModal(false);
            setEditingId(null);
            setFormData({ nombre: '', apellido: '', email: '', telefono: '', documento: '', direccion: '' });
            loadCustomers();
        } catch (err) {
            alert('Error al guardar cliente');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const deleteCustomer = async (id: string, name: string) => {
        if (!confirm(`¿Seguro que desea eliminar a ${name}?`)) return;
        try {
            const { error } = await insforge.database.from('customers').delete().eq('id', id);
            if (error) throw error;
            loadCustomers();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar cliente (posiblemente tiene órdenes activas)');
        }
    };

    const filteredCustomers = customers.filter(c =>
        `${c.nombre} ${c.apellido} ${c.documento}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <h1 className="text-2xl font-bold text-white">Gestión de <span className="text-accent">Clientes</span></h1>
                                <p className="text-xs text-muted">CRM de propietarios y leads</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setEditingId(null); setFormData({ nombre: '', apellido: '', email: '', telefono: '', documento: '', direccion: '' }); setShowModal(true); }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/20"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Cliente
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                    />
                </div>

                {/* Grid de Clientes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-48 bg-surface border border-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredCustomers.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-muted">
                            <User className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p>No se encontraron clientes.</p>
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <div key={customer.id} className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <button
                                        onClick={() => deleteCustomer(customer.id, `${customer.nombre} ${customer.apellido}`)}
                                        className="p-2 text-muted hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{customer.nombre} {customer.apellido}</h3>
                                <p className="text-xs text-muted mb-4 font-mono">{customer.documento || 'Sin documento'}</p>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <Mail className="w-4 h-4 text-accent/50" />
                                        <span className="truncate">{customer.email || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <Phone className="w-4 h-4 text-accent/50" />
                                        <span>{customer.telefono || '—'}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                                    <button className="flex-1 py-2 bg-surface-secondary hover:bg-surface-tertiary text-white text-xs font-bold rounded-lg border border-white/5 transition-colors">
                                        Ver Historial
                                    </button>
                                    <button
                                        onClick={() => openEditModal(customer)}
                                        className="px-3 py-2 bg-surface-secondary hover:bg-surface-tertiary text-white rounded-lg border border-white/5 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Cliente */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface-secondary/50">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Editar' : 'Nuevo'} <span className="text-accent">Cliente</span></h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-muted hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Nombre</label>
                                    <input required name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Apellido</label>
                                    <input required name="apellido" value={formData.apellido} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Documento (CI/RUT)</label>
                                    <input name="documento" value={formData.documento} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Teléfono</label>
                                    <input name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-medium ml-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-medium ml-1">Dirección</label>
                                <input name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full mt-4 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingId ? 'Actualizar Cliente' : 'Registrar Cliente')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Icono X que faltaba importar
function X(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
