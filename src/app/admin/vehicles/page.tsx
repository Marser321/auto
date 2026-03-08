'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, ExternalLink, Car } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

interface Vehicle {
    id: string;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    kilometraje: number;
    estado: string;
    created_at: string;
}

export default function VehiclesAdminPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadVehicles();
    }, []);

    async function loadVehicles() {
        setLoading(true);
        try {
            const { data, error } = await insforge.database
                .from('vehicle_inventory')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVehicles(data || []);
        } catch (err) {
            console.error('Error loading vehicles:', err);
        } finally {
            setLoading(false);
        }
    }

    async function deleteVehicle(id: string) {
        if (!confirm('¿Estás seguro de que querés eliminar este vehículo? Esta acción no se puede deshacer.')) return;

        try {
            const { error } = await insforge.database
                .from('vehicle_inventory')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setVehicles(vehicles.filter(v => v.id !== id));
        } catch (err) {
            alert('Error al eliminar vehículo');
            console.error(err);
        }
    }

    const filteredVehicles = vehicles.filter(v =>
        `${v.marca} ${v.modelo}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-surface-secondary/30">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted mb-1">
                                <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
                                <span>/</span>
                                <span className="text-white">Vehículos</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Gestión de <span className="text-accent">Inventario</span></h1>
                        </div>
                        <Link
                            href="/admin/vehicles/new"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/20"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Vehículo
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar por marca o modelo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors">
                            <Filter className="w-5 h-5 text-muted" />
                            <span>Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Año</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Precio / KM</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8 h-20 bg-white/[0.01]" />
                                        </tr>
                                    ))
                                ) : filteredVehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted">
                                            <Car className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>No se encontraron vehículos en el inventario.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                                        <Car className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold">{vehicle.marca} {vehicle.modelo}</p>
                                                        <p className="text-xs text-muted font-mono">{vehicle.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell text-sm text-white">
                                                {vehicle.anio}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-white">USD {vehicle.precio.toLocaleString()}</p>
                                                <p className="text-xs text-muted">{vehicle.kilometraje.toLocaleString()} km</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] uppercase font-black rounded-md ${vehicle.estado === 'disponible' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    vehicle.estado === 'reservado' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                        'bg-white/5 text-muted border border-white/10'
                                                    }`}>
                                                    {vehicle.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/catalogo/${vehicle.id}`}
                                                        className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                        title="Ver en catálogo"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/vehicles/edit/${vehicle.id}`}
                                                        className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteVehicle(vehicle.id)}
                                                        className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <div className="p-4 bg-surface border border-white/5 rounded-xl">
                        <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Stock</p>
                        <p className="text-2xl font-black text-white mt-1">{vehicles.length}</p>
                    </div>
                    <div className="p-4 bg-surface border border-white/5 rounded-xl">
                        <p className="text-xs text-muted uppercase font-bold tracking-wider">Disponibles</p>
                        <p className="text-2xl font-black text-green-400 mt-1">{vehicles.filter(v => v.estado === 'disponible').length}</p>
                    </div>
                    <div className="p-4 bg-surface border border-white/5 rounded-xl">
                        <p className="text-xs text-muted uppercase font-bold tracking-wider">Valor Inventario</p>
                        <p className="text-2xl font-black text-white mt-1">
                            USD {vehicles.reduce((acc, v) => acc + Number(v.precio), 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
