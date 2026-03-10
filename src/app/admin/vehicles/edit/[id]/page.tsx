'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Plus, Info, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

export default function EditVehiclePage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
        estado: 'disponible',
    });

    const [images, setImages] = useState<{ id?: string; url: string; file?: File; preview: string }[]>([]);
    const [features, setFeatures] = useState<{ id?: string; titulo: string; descripcion: string }[]>([]);
    const [newFeature, setNewFeature] = useState({ titulo: '', descripcion: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadVehicleData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Cargar info básica
            const { data: vehicle, error: vError } = await insforge.database
                .from('vehicle_inventory')
                .select('*')
                .eq('id', id)
                .single();

            if (vError) throw vError;
            setFormData(vehicle);

            // 2. Cargar imágenes
            const { data: vImages, error: iError } = await insforge.database
                .from('vehicle_images')
                .select('*')
                .eq('vehicle_id', id)
                .order('orden', { ascending: true });

            if (!iError && vImages) {
                setImages(vImages.map(img => ({ id: img.id, url: img.url, preview: img.url })));
            }

            // 3. Cargar características
            const { data: vFeatures, error: fError } = await insforge.database
                .from('vehicle_features')
                .select('*')
                .eq('vehicle_id', id);

            if (!fError && vFeatures) {
                setFeatures(vFeatures.map(f => ({ id: f.id, titulo: f.titulo, descripcion: f.descripcion })));
            }

        } catch (err: unknown) {
            setError('Error al cargar datos del vehículo');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            void loadVehicleData();
        }
    }, [id, loadVehicleData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'anio' || name === 'precio' || name === 'kilometraje' ? Number(value) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => ({
                file,
                url: '',
                preview: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = async (index: number) => {
        const img = images[index];
        if (img.id) {
            // Si tiene ID, es una imagen ya guardada, la marcamos para eliminar (o eliminamos al guardar)
            // Por simplicidad en este MVP, eliminamos de inmediato de la UI y de la DB
            try {
                const { error: dError } = await insforge.database.from('vehicle_images').delete().eq('id', img.id);
                if (dError) throw dError;
            } catch (err) {
                console.error('Error eliminando imagen de DB:', err);
            }
        }
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        if (!newFeature.titulo) return;
        setFeatures(prev => [...prev, { ...newFeature }]);
        setNewFeature({ titulo: '', descripcion: '' });
    };

    const removeFeature = async (index: number) => {
        const feat = features[index];
        if (feat.id) {
            try {
                await insforge.database.from('vehicle_features').delete().eq('id', feat.id);
            } catch (err) {
                console.error('Error eliminando característica:', err);
            }
        }
        setFeatures(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // 1. Update Vehicle info
            const { error: vError } = await insforge.database
                .from('vehicle_inventory')
                .update({ ...formData, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (vError) throw vError;

            // 2. Handle new images
            const newImages = images.filter(img => img.file);
            if (newImages.length > 0) {
                const uploadPromises = newImages.map(async (img) => {
                    const { data: uploadData, error: uError } = await insforge.storage
                        .from('vehicle-images')
                        .uploadAuto(img.file!);

                    if (uError || !uploadData) throw uError || new Error('Error subiendo imagen');

                    return {
                        vehicle_id: id,
                        url: uploadData.url,
                        tipo: 'gallery'
                    };
                });

                const imageData = await Promise.all(uploadPromises);
                const { error: iError } = await insforge.database.from('vehicle_images').insert(imageData);
                if (iError) throw iError;
            }

            // 3. Handle features (solo las nuevas que no tienen ID)
            const newFeatures = features.filter(f => !f.id);
            if (newFeatures.length > 0) {
                const featureData = newFeatures.map(f => ({
                    vehicle_id: id,
                    titulo: f.titulo,
                    descripcion: f.descripcion,
                    pos_x: 0,
                    pos_y: 0,
                    tipo: 'feature'
                }));

                const { error: fError } = await insforge.database.from('vehicle_features').insert(featureData);
                if (fError) throw fError;
            }

            setSuccess(true);
            setTimeout(() => router.push('/admin/vehicles'), 1500);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al actualizar el vehículo';
            setError(message);
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-surface-secondary/30 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
        </div>
    );

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
                                <h1 className="text-xl font-bold text-white">Editar <span className="text-accent">Vehículo</span></h1>
                                <p className="text-xs text-muted">{formData.marca} {formData.modelo} ({formData.anio})</p>
                            </div>
                        </div>
                        <button
                            form="vehicle-form"
                            disabled={saving || success}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/20 disabled:opacity-50 ${saving ? 'animate-pulse' : ''}`}
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Guardando...' : 'Actualizar Cambios'}
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
                        <p className="text-sm font-medium">¡Cambios guardados correctamente!</p>
                    </div>
                )}

                <form id="vehicle-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="p-6 bg-surface border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-accent" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Información Técnica</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">VIN / Chasis</label>
                                    <input required name="vin" value={formData.vin} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Estado</label>
                                    <select name="estado" value={formData.estado} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors appearance-none">
                                        <option value="disponible">Disponible</option>
                                        <option value="reservado">Reservado</option>
                                        <option value="vendido">Vendido</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Marca</label>
                                    <input required name="marca" value={formData.marca} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted font-medium ml-1">Modelo</label>
                                    <input required name="modelo" value={formData.modelo} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors" />
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

                            <div className="space-y-1.5">
                                <label className="text-xs text-muted font-medium ml-1">Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} rows={4} className="w-full px-4 py-2.5 bg-surface-secondary border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors resize-none" />
                            </div>
                        </section>

                        <section className="p-6 bg-surface border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-accent" />
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Galería de Fotos</h2>
                                </div>
                                <span className="text-[10px] text-muted font-mono">{images.length} fotos</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square group">
                                        <img
                                            src={img.preview}
                                            alt={`Imagen ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border border-white/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-white/10 hover:border-accent/30 rounded-xl flex flex-col items-center justify-center gap-2 text-muted hover:text-accent transition-all group"
                                >
                                    <Plus className="w-6 h-6" />
                                    <span className="text-[10px] font-bold uppercase">Añadir</span>
                                </button>
                            </div>
                            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="p-6 bg-surface border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Plus className="w-4 h-4 text-accent" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Características</h2>
                            </div>
                            <div className="space-y-2">
                                {features.map((f, i) => (
                                    <div key={i} className="p-3 bg-surface-secondary border border-white/5 rounded-xl flex justify-between items-center group">
                                        <span className="text-sm text-white">{f.titulo}</span>
                                        <button type="button" onClick={() => removeFeature(i)} className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 flex gap-2">
                                <input
                                    value={newFeature.titulo}
                                    onChange={(e) => setNewFeature(prev => ({ ...prev, titulo: e.target.value }))}
                                    placeholder="Nueva característica..."
                                    className="flex-1 px-3 py-2 bg-surface-secondary border border-white/10 rounded-lg text-sm text-white focus:outline-none"
                                />
                                <button type="button" onClick={addFeature} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </section>
                    </div>
                </form>
            </main>
        </div>
    );
}
