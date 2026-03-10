import { createClient } from '@insforge/sdk';

const hasBaseUrl = Boolean(process.env.NEXT_PUBLIC_INSFORGE_BASE_URL);
const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY);

export const isInsforgeConfigured = hasBaseUrl && hasAnonKey;

export const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://kchej38e.us-east.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
});
