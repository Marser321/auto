/**
 * Validador de VIN (Vehicle Identification Number)
 * Un VIN válido tiene exactamente 17 caracteres alfanuméricos (sin I, O, Q)
 * y pasa la verificación del check-digit (posición 9).
 */

const TRANSLITERATION: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

function transliterate(char: string): number {
    if (/\d/.test(char)) return parseInt(char, 10);
    return TRANSLITERATION[char.toUpperCase()] || 0;
}

export function validarFormatoVIN(vin: string): { valido: boolean; error?: string } {
    if (!vin) return { valido: false, error: 'El VIN es obligatorio' };

    const vinUpper = vin.toUpperCase().trim();

    if (vinUpper.length !== 17) {
        return { valido: false, error: 'El VIN debe tener exactamente 17 caracteres' };
    }

    if (/[IOQ]/.test(vinUpper)) {
        return { valido: false, error: 'El VIN no puede contener las letras I, O o Q' };
    }

    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vinUpper)) {
        return { valido: false, error: 'El VIN solo puede contener letras (excepto I, O, Q) y números' };
    }

    // Check-digit (posición 9)
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += transliterate(vinUpper[i]) * WEIGHTS[i];
    }
    const remainder = sum % 11;
    const checkDigit = remainder === 10 ? 'X' : remainder.toString();

    if (vinUpper[8] !== checkDigit) {
        return { valido: false, error: 'El dígito verificador del VIN no es válido' };
    }

    return { valido: true };
}

/**
 * Validación simple (solo formato, sin check-digit)
 * Útil para UX rápida en el frontend
 */
export function validarFormatoVINBasico(vin: string): boolean {
    if (!vin) return false;
    const vinUpper = vin.toUpperCase().trim();
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(vinUpper);
}
