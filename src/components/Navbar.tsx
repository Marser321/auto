'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Car } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/servicios', label: 'Servicios VIP' },
    { href: '/permutas', label: 'Permutas' },
    { href: '/admin', label: 'Admin' },
];

export default function Navbar() {
    const [menuAbierto, setMenuAbierto] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-effect glass-dirty glass-highlight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Auto<span className="text-accent">Hub</span>
                        </span>
                    </Link>

                    {/* Links - Desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 text-sm font-medium text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Button asChild>
                            <Link href="/permutas">
                                Tasá Tu Auto
                            </Link>
                        </Button>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="md:hidden p-2 text-muted hover:text-white transition-colors"
                        aria-label="Menú"
                    >
                        {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuAbierto && (
                <div className="md:hidden glass-effect glass-dirty glass-highlight border-t border-white/5 animate-fade-in">
                    <div className="px-4 py-3 space-y-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuAbierto(false)}
                                className="block px-4 py-3 text-sm font-medium text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Button asChild className="w-full">
                            <Link href="/permutas" onClick={() => setMenuAbierto(false)}>
                                Tasá Tu Auto
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
