export type DemoImage = {
    id: string;
    url: string;
    tipo: 'hero' | 'gallery';
    orden: number;
};

export type DemoVehicle = {
    id: string;
    vin: string;
    marca: string;
    modelo: string;
    anio: number;
    precio: number;
    kilometraje: number;
    transmision: string;
    combustible: string;
    color: string;
    descripcion: string;
    estado: string;
    imagen_url: string;
    imagenes: DemoImage[];
    imagen_360_url: string;
};

const makeImages = (id: string): DemoImage[] => ([
    { id: `${id}-hero`, url: `/demo/vehicles/${id}/hero.jpg`, tipo: 'hero', orden: 1 },
    { id: `${id}-gallery-1`, url: `/demo/vehicles/${id}/hero.jpg`, tipo: 'gallery', orden: 2 },
    { id: `${id}-gallery-2`, url: `/demo/vehicles/${id}/hero.jpg`, tipo: 'gallery', orden: 3 },
]);

export const DEMO_PLACEHOLDER = '/demo/placeholder.jpg';

export const DEMO_VEHICLES: DemoVehicle[] = [
    {
        id: 'demo-1',
        vin: 'WVWZZZ1KZAP012345',
        marca: 'Volkswagen',
        modelo: 'Golf Trendline 1.6',
        anio: 2018,
        precio: 13900,
        kilometraje: 72000,
        transmision: 'Manual',
        combustible: 'Nafta',
        color: 'Azul',
        descripcion: 'Volkswagen Golf Trendline 1.6 con mantenimiento al dia, llantas de aleacion y pantalla multimedia. Ideal para uso urbano y ruta.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-1/hero.jpg',
        imagenes: makeImages('demo-1'),
        imagen_360_url: '/360/car-interior-1.jpg',
    },
    {
        id: 'demo-2',
        vin: 'WME4513341K123456',
        marca: 'Smart',
        modelo: 'Forfour Brabus',
        anio: 2017,
        precio: 11200,
        kilometraje: 54000,
        transmision: 'Automatica',
        combustible: 'Nafta',
        color: 'Negro',
        descripcion: 'Smart Forfour Brabus compacto y agil, con buen equipamiento urbano y consumo eficiente.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-2/hero.jpg',
        imagenes: makeImages('demo-2'),
        imagen_360_url: '/360/car-interior-1.jpg',
    },
    {
        id: 'demo-3',
        vin: '1FTFW1E58JFB12345',
        marca: 'Ford',
        modelo: 'F-250 Lariat 4x4',
        anio: 2019,
        precio: 48900,
        kilometraje: 68000,
        transmision: 'Automatica',
        combustible: 'Diesel',
        color: 'Negro',
        descripcion: 'Pickup robusta y potente, preparada para trabajo pesado y aventura. Cabina doble y suspension reforzada.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-3/hero.jpg',
        imagenes: makeImages('demo-3'),
        imagen_360_url: '/360/car-interior-2.jpg',
    },
    {
        id: 'demo-4',
        vin: 'WBA8B9C50JAB12345',
        marca: 'BMW',
        modelo: '330i M Sport',
        anio: 2021,
        precio: 46800,
        kilometraje: 29000,
        transmision: 'Automatica',
        combustible: 'Nafta',
        color: 'Blanco',
        descripcion: 'Sedan premium con paquete M Sport, faros LED, cuero y sistema multimedia avanzado.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-4/hero.jpg',
        imagenes: makeImages('demo-4'),
        imagen_360_url: '/360/car-interior-2.jpg',
    },
    {
        id: 'demo-5',
        vin: '3C3CFFKR1DT123456',
        marca: 'Fiat',
        modelo: '500 Lounge',
        anio: 2016,
        precio: 9800,
        kilometraje: 61000,
        transmision: 'Manual',
        combustible: 'Nafta',
        color: 'Gris',
        descripcion: 'Fiat 500 Lounge con techo panoramico, sensores de estacionamiento y diseno urbano retro.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-5/hero.jpg',
        imagenes: makeImages('demo-5'),
        imagen_360_url: '/360/car-interior-1.jpg',
    },
    {
        id: 'demo-6',
        vin: 'WF0DP3TH6F4123456',
        marca: 'Ford',
        modelo: 'Focus SE',
        anio: 2018,
        precio: 12600,
        kilometraje: 83000,
        transmision: 'Manual',
        combustible: 'Nafta',
        color: 'Plata',
        descripcion: 'Ford Focus SE con excelente comportamiento en ruta, control de estabilidad y conectividad Bluetooth.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-6/hero.jpg',
        imagenes: makeImages('demo-6'),
        imagen_360_url: '/360/car-interior-1.jpg',
    },
    {
        id: 'demo-7',
        vin: 'WBA8E9C52KAB12345',
        marca: 'BMW',
        modelo: '340i Touring',
        anio: 2020,
        precio: 52900,
        kilometraje: 34000,
        transmision: 'Automatica',
        combustible: 'Nafta',
        color: 'Negro',
        descripcion: 'Touring premium con gran espacio de carga, traccion integral y equipamiento deportivo.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-7/hero.jpg',
        imagenes: makeImages('demo-7'),
        imagen_360_url: '/360/car-interior-3.jpg',
    },
    {
        id: 'demo-8',
        vin: 'ZFF79ALA4J0234567',
        marca: 'Ferrari',
        modelo: '488 GTB',
        anio: 2019,
        precio: 245000,
        kilometraje: 12000,
        transmision: 'Automatica',
        combustible: 'Nafta',
        color: 'Rojo',
        descripcion: 'Superdeportivo con sonido y performance iconicos. Experiencia premium para clientes exigentes.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-8/hero.jpg',
        imagenes: makeImages('demo-8'),
        imagen_360_url: '/360/car-interior-3.jpg',
    },
    {
        id: 'demo-9',
        vin: 'JM1BPALM7K1234567',
        marca: 'Mazda',
        modelo: '3 Hatchback',
        anio: 2020,
        precio: 18900,
        kilometraje: 41000,
        transmision: 'Automatica',
        combustible: 'Nafta',
        color: 'Rojo',
        descripcion: 'Mazda 3 con diseno deportivo, seguridad avanzada y excelente confort de marcha.',
        estado: 'disponible',
        imagen_url: '/demo/vehicles/demo-9/hero.jpg',
        imagenes: makeImages('demo-9'),
        imagen_360_url: '/360/car-interior-2.jpg',
    },
];

export const DEMO_VEHICLES_MAP = DEMO_VEHICLES.reduce<Record<string, DemoVehicle>>((acc, vehiculo) => {
    acc[vehiculo.id] = vehiculo;
    return acc;
}, {});

export function getDemoVehicleById(id: string | null | undefined): DemoVehicle | undefined {
    if (!id) return undefined;
    return DEMO_VEHICLES_MAP[id];
}
