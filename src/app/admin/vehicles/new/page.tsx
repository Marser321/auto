'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, Plus, Info, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

export default function NewVehiclePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        vin: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        precio: 0,
        kilometraje: 0,
        transmision: 'Manual',
        combustible: 'Nafta',
        color: '',
        descripcion: '',
        imagen_360_url: '',
    });

    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [features, setFeatures] = useState<{ titulo: string; descripcion: string }[]>([]);

    // Feature temp state
    const [newFeature, setNewFeature] = useState({ titulo: '', descripcion: '' });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'anio' || name === 'precio' || name === 'kilometraje' ? Number(value) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const addFeature = () => {
        if (!newFeature.titulo) return;
        setFeatures(prev => [...prev, newFeature]);
        setNewFeature({ titulo: '', descripcion: '' });
    };

    const removeFeature = (index: number) => {
        setFeatures(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validaciones previas
            if (!formData.vin || formData.vin.length < 5) throw new Error('El VIN es demasiado corto o inválido.');
            if (formData.precio <= 0) throw new Error('El precio debe ser mayor a 0.');

            // 1. Verificar si el VIN ya existe (Pre-check para mejor UX)
            const { data: existingVin } = await insforge.database
                .from('vehicle_inventory')
                .select('id')
                .eq('vin', formData.vin)
                .maybeSingle();

            if (existingVin) {
                throw new Error(`Ya existe un vehículo registrado con el VIN: ${formData.vin}`);
            }

            // Sanitizar datos para la inserción (quitar campos vacíos que puedan romper constraints)
            const insertData = {
                ...formData,
                estado: 'disponible',
                updated_at: new Date().toISOString()
            };

            // 2. Insert Vehicle basic info
            const { data: vehicle, error: vError } = await insforge.database
                .from('vehicle_inventory')
                .insert([insertData])
                .select()
                .single();

            if (vError) {
                console.error('Database Error:', vError);
                throw new Error(`Error de base de datos: ${vError.message || 'No se pudo insertar el vehículo.'}`);
            }

            if (!vehicle) throw new Error('No se recibió confirmación de creación del vehículo.');

            // 3. Upload images and insert references
            if (images.length > 0) {
                const uploadPromises = images.map(async (img, index) => {
                    try {
                        const { data: uploadData, error: uError } = await insforge.storage
                            .from('vehicle-images')
                            .uploadAuto(img.file);

                        if (uError || !uploadData) throw uError || new Error('Fallo en la subida');

                        return {
                            vehicle_id: vehicle.id,
                            url: uploadData.url,
                            tipo: index === 0 ? 'main' : 'gallery', // El primero es el principal
                            orden: index
                        };
                    } catch (uploadErr: any) {
                        console.error(`Error subiendo imagen ${index}:`, uploadErr);
                        return null; // Omitir imagen fallida
                    }
                });

                const imageDataRaw = await Promise.all(uploadPromises);
                const imageData = imageDataRaw.filter(img => img !== null);

                if (imageData.length > 0) {
                    const { error: iError } = await insforge.database
                        .from('vehicle_images')
                        .insert(imageData);
                    if (iError) console.error('Error insertando imágenes en DB:', iError);
                }
            }

            // 4. Insert features
            if (features.length > 0) {
                const featureData = features.map(f => ({
                    vehicle_id: vehicle.id,
                    titulo: f.titulo,
                    descripcion: f.descripcion,
                    pos_x: 0,
                    pos_y: 0,
                    tipo: 'feature'
                }));

                const { error: fError } = await insforge.database
                    .from('vehicle_features')
                    .insert(featureData);
                if (fError) console.error('Error insertando características:', fError);
            }

            setSuccess(true);
            setTimeout(() => router.push('/admin/vehicles'), 1500);

        } catch (err: any) {
            setError(err.message || 'Error inesperado al guardar el vehículo');
            console.error('Submit Error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-surface-secondary/30 pb-20">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/vehicles" className="p-2 hover:bg-white/5 rounded-xl text-muted hover:text-white transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Nuevo <span className="text-accent">Vehículo</span></h1>
                                <p className="text-xs text-muted">Completá los datos técnicos e imágenes</p>
                            </div>
                        </div>
                        <button
                            form="vehicle-form"
                            disabled={loading || success}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'animate-pulse' : ''}`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {loading ? 'Guardando...' : 'Guardar Vehículo'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400 animate-fade-in">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">¡Vehículo guardado correctamente! Redirigiendo...</p>
                    </div>
                )}

                <form id="vehicle-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Datos Básicos */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="p-6 bg-surface border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-accent" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Información Técnica</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">VIN / Chasis</label>
                                    <input required name="vin" value={formData.vin} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" placeholder="N° de chasis..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Año</label>
                                    <input required type="number" name="anio" value={formData.anio} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Marca</label>
                                    <input required name="marca" value={formData.marca} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" placeholder="Ej: Volkswagen" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Modelo</label>
                                    <input required name="modelo" value={formData.modelo} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" placeholder="Ej: Golf GTI" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Precio (USD)</label>
                                    <input required type="number" name="precio" value={formData.precio} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Kilometraje</label>
                                    <input required type="number" name="kilometraje" value={formData.kilometraje} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Transmisión</label>
                                    <select name="transmision" value={formData.transmision} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors appearance-none">
                                        <option value="Manual">Manual</option>
                                        <option value="Automática">Automática</option>
                                        <option value="Secuencial">Secuencial</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Combustible</label>
                                    <select name="combustible" value={formData.combustible} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors appearance-none">
                                        <option value="Nafta">Nafta</option>
                                        <option value="Diésel">Diésel</option>
                                        <option value="Híbrido">Híbrido</option>
                                        <option value="Eléctrico">Eléctrico</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-medium ml-1">Descripción corta</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows={4} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors resize-none" placeholder="Detalles atractivos sobre el vehículo..." />
                            </div>
                        </section>

                        <section className="p-6 bg-surface border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-accent" />
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Galería de Fotos</h2>
                                </div>
                                <span className="text-[10px] text-muted font-mono">{images.length} archivos seleccionados</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square group">
                                        <img src={img.preview} className="w-full h-full object-cover rounded-xl border border-white/10" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        {i === 0 && (
                                            <div className="absolute bottom-0 inset-x-0 p-1 bg-accent/90 text-center rounded-b-xl">
                                                <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Portada</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-white/10 hover:border-accent/30 rounded-xl flex flex-col items-center justify-center gap-2 text-muted hover:text-accent transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium">Subir fotos</span>
                                </button>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </section>
                    </div>

                    {/* Columna Derecha: Features y Multimedia */}
                    <div className="space-y-6">
                        <section className="p-6 bg-surface border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-accent" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Equipamiento / Destacados</h2>
                            </div>

                            <div className="space-y-3">
                                {features.map((f, i) => (
                                    <div key={i} className="p-3 bg-surface-secondary border border-white/5 rounded-xl group flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-white">{f.titulo}</p>
                                            {f.descripcion && <p className="text-xs text-muted">{f.descripcion}</p>}
                                        </div>
                                        <button type="button" onClick={() => removeFeature(i)} className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <input
                                    value={newFeature.titulo}
                                    onChange={(e) => setNewFeature(prev => ({ ...prev, titulo: e.target.value }))}
                                    placeholder="Nombre del equipamiento..."
                                    className="w-full px-4 py-2 bg-surface-secondary border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Añadir Característica
                                </button>
                            </div>
                        </section>

                        <section className="p-6 bg-surface border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-4 h-4 text-accent" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multimedia Avanzada</h2>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted font-bold uppercase tracking-wider ml-1">URL Interior 360° Equirectangular</label>
                                <input
                                    name="imagen_360_url"
                                    value={formData.imagen_360_url}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl font-mono text-xs text-accent focus:outline-none focus:border-accent/50 transition-colors"
                                    placeholder="https://storage.insforge.app/..."
                                />
                            </div>
                            <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
                                <p className="text-xs text-accent/80 leading-relaxed italic">
                                    &quot;Próximamente: Botón para solicitar nuestro servicio de tour virtual 360&deg; y video reel profesional directamente acá.&quot;
                                </p>
                            </div>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
}
