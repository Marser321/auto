import Link from 'next/link';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="glass-effect glass-highlight border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Auto<span className="text-accent">Hub</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted leading-relaxed">
                            Tu concesionaria digital de confianza. Los mejores vehículos con visualización 360° y financiación a medida.
                        </p>
                    </div>

                    {/* Enlaces */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navegación</h3>
                        <ul className="space-y-2">
                            {[
                                { href: '/catalogo', label: 'Catálogo' },
                                { href: '/permutas', label: 'Permutas' },
                                { href: '/contacto', label: 'Contacto' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted hover:text-accent transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Servicios */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Servicios</h3>
                        <ul className="space-y-2 text-sm text-muted">
                            <li>Compra de Vehículos</li>
                            <li>Tasación de Permutas</li>
                            <li>Financiación</li>
                            <li>Garantía Extendida</li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contacto</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-muted">
                                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                                <span>+598 99 123 456</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted">
                                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                                <span>info@autohub.com.uy</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-muted">
                                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                <span>Av. Italia 1234, Montevideo</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-muted">
                        © {new Date().getFullYear()} AutoHub. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
