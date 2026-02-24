export const services = [
    {
        id: 'interpretacion-suenos',
        title: 'Interpretación de Sueños',
        description: 'Sesión de 20 minutos combinando saberes ancestrales y canalización para comprender los mensajes de tu inconsciente.',
        price: '$35.000 COP',
        priceNumber: 35000,
        icon: '☁️',
        calendlyUrl: 'https://calendly.com/diegoillers/interpretacion-suenos'
    },
    {
        id: 'lectura-rapida',
        title: 'Lectura Rápida',
        description: 'Guía de tus ángeles para una pregunta o situación específica. Ideal si dispones de poco tiempo (20 minutos).',
        price: '$35.000 COP',
        priceNumber: 35000,
        icon: '✨',
        calendlyUrl: 'https://calendly.com/diegoillers/lectura-rapida'
    },
    {
        id: 'lectura-vinculo',
        title: 'Lectura de Vínculo',
        description: 'Profundiza espiritualmente en una relación (romántica, familiar o amistad). Descubre propósitos, retos y posibilidades del vínculo.',
        price: '$116.000 COP',
        priceNumber: 116000,
        icon: '❤️',
        calendlyUrl: 'https://calendly.com/diegoillers/lectura-vinculo'
    },
    {
        id: 'lectura-angelical',
        title: 'Lectura de Tarot Angelical',
        description: 'Guía de tus ángeles en todos los aspectos de tu vida (1 hora). Incluye preguntas específicas y un mensaje de poder.',
        price: '$85.000 COP',
        priceNumber: 85000,
        icon: '🪽',
        calendlyUrl: 'https://calendly.com/diegoillers/lectura-angelical'
    },
    {
        id: 'lectura-numerologica',
        title: 'Tarot Angelical y Misión de Vida',
        description: 'Incluye la lectura angelical más una interpretación numerológica de tu esencia, regalos divinos, vidas pasadas y misión de vida.',
        price: '$105.000 COP',
        priceNumber: 105000,
        icon: '🔢',
        calendlyUrl: 'https://calendly.com/diegoillers/mision-vida'
    },
    {
        id: 'lectura-cumpleanos',
        title: 'Lectura de Cumpleaños',
        description: 'Energía de tus próximos 12 meses con Tarot y runas. Conoce los ángeles que te acompañarán en tu nuevo ciclo y recibe un ritual asignado.',
        price: '$116.000 COP',
        priceNumber: 116000,
        icon: '🎂',
        calendlyUrl: 'https://calendly.com/diegoillers/lectura-cumpleanos'
    },
    {
        id: 'limpieza-vinculos',
        title: 'Ritual: Limpieza y Armonización de Vínculos',
        description: 'Proceso de sanación enfocado en restablecer la armonía y equilibrar las energías discordantes dentro de tus relaciones más importantes.',
        price: 'Agendar Valoración',
        priceNumber: 0,
        icon: '🔗',
        calendlyUrl: 'https://calendly.com/diegoillers/limpieza-vinculos'
    },
    {
        id: 'limpieza-chakras',
        title: 'Ritual: Limpieza Energética y Balance de Chakras',
        description: 'Renueva tu campo áurico eliminando estancamientos. Este ritual alinea tus centros energéticos, devolviéndote la vitalidad y claridad.',
        price: 'Agendar Valoración',
        priceNumber: 0,
        icon: '🧘‍♀️',
        calendlyUrl: 'https://calendly.com/diegoillers/limpieza-chakras'
    }
];

export const getServiceById = (id: string) => {
    return services.find(s => s.id === id);
};

export const products = [
    {
        id: 'set-cristales-proteccion',
        title: 'Set de Cristales de Protección',
        description: 'Kit de 4 cuarzos curados (Turmalina, Amatista, Ojo de Tigre y Selenita) para proteger y equilibrar la energía de tus espacios o llevar contigo.',
        price: '$65.000 COP',
        priceNumber: 65000,
        imagePlaceholder: '💎'
    },
    {
        id: 'esencia-aurica-serenidad',
        title: 'Esencia Áurica "Serenidad"',
        description: 'Spray alquímico artesanal a base de aceites esenciales de lavanda, salvia y agua florida para limpiar la bruma mental rápidamente.',
        price: '$45.000 COP',
        priceNumber: 45000,
        imagePlaceholder: '🌿'
    },
    {
        id: 'vela-intencion-abundancia',
        title: 'Vela de Intención: Abundancia',
        description: 'Vela de soja vegana consagrada, con especias y canela, diseñada para encender en luna creciente y enfocar la energía en la manifestación material.',
        price: '$38.000 COP',
        priceNumber: 38000,
        imagePlaceholder: '🕯️'
    },
    {
        id: 'bitacora-lunar-2024',
        title: 'Bitácora Lunar y Astrológica',
        description: 'Diario guiado mes a mes con los tránsitos astrológicos, fases lunares y ejercicios prácticos de journaling para tu crecimiento anual.',
        price: '$75.000 COP',
        priceNumber: 75000,
        imagePlaceholder: '📔'
    },
    {
        id: 'pulsera-cuarzo-rosa',
        title: 'Amuleto: Pulsera Cuarzo Rosa',
        description: 'Pulsera tejida con piedra natural de cuarzo rosa para potenciar el amor propio y atraer vínculos sanos. Ritualizada bajo tu nombre.',
        price: '$55.000 COP',
        priceNumber: 55000,
        imagePlaceholder: '📿'
    }
];

export const getProductById = (id: string) => {
    return products.find(p => p.id === id);
};
