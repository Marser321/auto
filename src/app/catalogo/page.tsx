'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Heart, Clock } from 'lucide-react';
import VehicleCard from '@/components/VehicleCard';
import { insforge } from '@/lib/insforge';

// Datos demo fallback
const VEHICULOS_DEMO = [
    { id: 'demo-1', imagen_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80', marca: 'Volkswagen', modelo: 'Gol Trend 1.6', anio: 2019, precio: 12500, kilometraje: 65000, transmision: 'Manual', combustible: 'Nafta' },
    { id: 'demo-2', imagen_url: 'https://images.unsplash.com/photo-1621007947382-34860ee6e992?w=600&q=80', marca: 'Chevrolet', modelo: 'Onix 1.0 Turbo', anio: 2022, precio: 16900, kilometraje: 28000, transmision: 'Automática', combustible: 'Nafta' },
    { id: 'demo-3', imagen_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80', marca: 'Peugeot', modelo: '208 Active 1.2', anio: 2021, precio: 15500, kilometraje: 42000, transmision: 'Manual', combustible: 'Nafta' },
    { id: 'demo-4', imagen_url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&q=80', marca: 'Toyota', modelo: 'Hilux SRV 2.8', anio: 2018, precio: 35000, kilometraje: 115000, transmision: 'Automática', combustible: 'Diésel' },
    { id: 'demo-5', imagen_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80', marca: 'Renault', modelo: 'Kwid Zen 1.0', anio: 2020, precio: 10800, kilometraje: 55000, transmision: 'Manual', combustible: 'Nafta' },
    { id: 'demo-6', imagen_url: 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=600&q=80', marca: 'Ford', modelo: 'Fiesta Kinetic Design', anio: 2017, precio: 11500, kilometraje: 89000, transmision: 'Manual', combustible: 'Nafta' },
    { id: 'demo-7', imagen_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80', marca: 'Honda', modelo: 'Civic EX-L 2.0', anio: 2019, precio: 24500, kilometraje: 52000, transmision: 'Automática', combustible: 'Nafta' },
    { id: 'demo-8', imagen_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80', marca: 'Volkswagen', modelo: 'Nivus Highline', anio: 2023, precio: 28900, kilometraje: 15000, transmision: 'Automática', combustible: 'Nafta' },
    { id: 'demo-9', imagen_url: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&q=80', marca: 'Fiat', modelo: 'Toro Volcano 2.0', anio: 2021, precio: 31000, kilometraje: 45000, transmision: 'Automática', combustible: 'Diésel' },
];

const MARCAS = ['Todas', 'Volkswagen', 'Chevrolet', 'Peugeot', 'Toyota', 'Renault', 'Ford', 'Honda', 'Fiat'];
const COMBUSTIBLES = ['Todos', 'Nafta', 'Diésel', 'Híbrido'];

export default function CatalogoPage() {
    const [vehiculos, setVehiculos] = useState(VEHICULOS_DEMO);
    const [busqueda, setBusqueda] = useState('');
    const [marcaFiltro, setMarcaFiltro] = useState('Todas');
    const [combustibleFiltro, setCombustibleFiltro] = useState('Todos');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [soloFavoritos, setSoloFavoritos] = useState(false);
    const [favoritosIds, setFavoritosIds] = useState<string[]>([]);

    // Historial state
    const [historialIds, setHistorialIds] = useState<string[]>([]);
    const [vehiculosHistorial, setVehiculosHistorial] = useState<any[]>([]);

    useEffect(() => {
        async function cargar() {
            try {
                const { data } = await insforge.database
                    .from('vehicle_inventory')
                    .select('*, vehicle_images(url)')
                    .eq('estado', 'disponible')
                    .order('created_at', { ascending: false });

                if (data && data.length > 0) {
                    setVehiculos(
                        data.map((v: Record<string, unknown>) => ({
                            id: v.id as string,
                            imagen_url: (v.vehicle_images as Array<{ url: string }>)?.[0]?.url || VEHICULOS_DEMO[0].imagen_url,
                            marca: v.marca as string,
                            modelo: v.modelo as string,
                            anio: v.anio as number,
                            precio: v.precio as number,
                            kilometraje: v.kilometraje as number,
                            transmision: v.transmision as string,
                            combustible: v.combustible as string,
                        }))
                    );
                }
            } catch {
                // Fallback silencioso
            } finally {
                setCargando(false);
            }
        }
        cargar();

        // Cargar favoritos
        const cargarFavs = () => {
            setFavoritosIds(JSON.parse(localStorage.getItem('autohub_favoritos') || '[]'));
        };
        cargarFavs();

        // Cargar Histórico Inicial
        const cargarHistorial = () => {
            setHistorialIds(JSON.parse(localStorage.getItem('autohub_historial') || '[]'));
        };
        cargarHistorial();

        // Escuchar por cambios de favs emitidos por las cards
        window.addEventListener('favoritosActualizados', cargarFavs);
        window.addEventListener('historialActualizado', cargarHistorial);
        return () => {
            window.removeEventListener('favoritosActualizados', cargarFavs);
            window.removeEventListener('historialActualizado', cargarHistorial);
        }
    }, []);

    useEffect(() => {
        if (historialIds.length === 0) {
            setVehiculosHistorial([]);
            return;
        }
        const combi = [...vehiculos, ...VEHICULOS_DEMO];
        // Filtramos para asegurar que esten primero en el array
        const vistosObject = historialIds.map(id => combi.find(v => v.id === id)).filter(Boolean);
        setVehiculosHistorial(vistosObject);
    }, [historialIds, vehiculos]);

    const vehiculosFiltrados = vehiculos.filter((v) => {
        const matchBusqueda =
            busqueda === '' ||
            `${v.marca} ${v.modelo} ${v.anio}`.toLowerCase().includes(busqueda.toLowerCase());
        const matchMarca = marcaFiltro === 'Todas' || v.marca === marcaFiltro;
        const matchCombustible = combustibleFiltro === 'Todos' || v.combustible === combustibleFiltro;
        const matchFavorito = soloFavoritos ? favoritosIds.includes(v.id) : true;

        return matchBusqueda && matchMarca && matchCombustible && matchFavorito;
    });

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-surface border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                        Nuestro <span className="text-accent">Catálogo</span>
                    </h1>
                    <p className="mt-2 text-muted">
                        Encontrá el vehículo perfecto entre nuestras {vehiculos.length} unidades disponibles.
                    </p>

                    {/* Barra de búsqueda */}
                    <div className="mt-6 flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                            <input
                                type="text"
                                placeholder="Buscar por marca, modelo o año..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-surface-secondary border border-white/10 rounded-xl text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
                            />
                            {busqueda && (
                                <button
                                    onClick={() => setBusqueda('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${mostrarFiltros
                                ? 'bg-accent border-accent text-white'
                                : 'bg-surface-secondary border-white/10 text-muted hover:text-white'
                                }`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm font-medium">Filtros</span>
                        </button>
                    </div>

                    {/* Boton Favoritos */}
                    <div className="mt-4 flex gap-2 animate-fade-in">
                        <button
                            onClick={() => {
                                setSoloFavoritos(!soloFavoritos);
                                // Actualizamos manual la lista para asegurar el estado más reciente
                                setFavoritosIds(JSON.parse(localStorage.getItem('autohub_favoritos') || '[]'));
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${soloFavoritos
                                ? 'bg-accent/20 border-accent text-accent'
                                : 'bg-surface-secondary border-white/10 text-muted hover:text-white'
                                }`}
                        >
                            <Heart className={`w-4 h-4 transition-transform ${soloFavoritos ? 'fill-accent scale-110' : ''}`} />
                            Mis Favoritos ({favoritosIds.length})
                        </button>
                    </div>

                    {/* Panel de filtros */}
                    {mostrarFiltros && (
                        <div className="mt-4 p-4 bg-surface-secondary rounded-xl border border-white/10 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Marca</label>
                                    <select
                                        value={marcaFiltro}
                                        onChange={(e) => setMarcaFiltro(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-surface-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent/50"
                                    >
                                        {MARCAS.map((marca) => (
                                            <option key={marca} value={marca}>{marca}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Combustible</label>
                                    <select
                                        value={combustibleFiltro}
                                        onChange={(e) => setCombustibleFiltro(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-surface-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent/50"
                                    >
                                        {COMBUSTIBLES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid de vehículos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {cargando ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-surface-secondary rounded-2xl overflow-hidden border border-white/5 animate-pulse">
                                <div className="aspect-[16/10] bg-surface-tertiary" />
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-surface-tertiary rounded w-3/4" />
                                    <div className="h-7 bg-surface-tertiary rounded w-1/2" />
                                    <div className="h-4 bg-surface-tertiary rounded w-full" />
                                    <div className="h-10 bg-surface-tertiary rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : vehiculosFiltrados.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted">No se encontraron vehículos con esos filtros.</p>
                        <button
                            onClick={() => {
                                setBusqueda('');
                                setMarcaFiltro('Todas');
                                setCombustibleFiltro('Todos');
                            }}
                            className="mt-4 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted mb-6">
                            {vehiculosFiltrados.length} vehículo{vehiculosFiltrados.length !== 1 ? 's' : ''} encontrado{vehiculosFiltrados.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehiculosFiltrados.map((vehiculo) => (
                                <VehicleCard key={vehiculo.id} {...vehiculo} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* HISTORIAL: Vistos Recientemente */}
            {vehiculosHistorial.length > 0 && !soloFavoritos && busqueda === '' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20 relative animate-fade-in opactiy-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">Vistos Recientemente</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {vehiculosHistorial.map((vehiculo: any) => (
                            <div key={`hist-${vehiculo.id}`} className="transform scale-[0.85] -m-4 origin-top">
                                <VehicleCard {...vehiculo} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
