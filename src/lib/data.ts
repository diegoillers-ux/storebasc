export const services = [
    {
        id: 'servicio-inicial',
        title: 'Servicio Inicial',
        description: 'Sesion introductoria para conocer el servicio y definir objetivos.',
        price: '$35.000 COP',
        priceNumber: 35000,
        icon: '*',
    },
    {
        id: 'servicio-express',
        title: 'Servicio Express',
        description: 'Atencion corta para consultas puntuales de clientes.',
        price: '$35.000 COP',
        priceNumber: 35000,
        icon: '+',
    },
    {
        id: 'servicio-completo',
        title: 'Servicio Completo',
        description: 'Sesion extendida con diagnostico y recomendaciones personalizadas.',
        price: '$116.000 COP',
        priceNumber: 116000,
        icon: '#',
    },
    {
        id: 'asesoria-especializada',
        title: 'Asesoria Especializada',
        description: 'Acompanamiento de una hora para casos con mayor profundidad.',
        price: '$85.000 COP',
        priceNumber: 85000,
        icon: '@',
    },
    {
        id: 'plan-personalizado',
        title: 'Plan Personalizado',
        description: 'Incluye asesoria y propuesta de plan de accion para seguimiento.',
        price: '$105.000 COP',
        priceNumber: 105000,
        icon: '%',
    },
    {
        id: 'sesion-premium',
        title: 'Sesion Premium',
        description: 'Sesion avanzada para clientes que requieren soporte integral.',
        price: '$116.000 COP',
        priceNumber: 116000,
        icon: '&',
    },
];

export const getServiceById = (id: string) => {
    return services.find((s) => s.id === id);
};

export const products = [
    {
        id: 'producto-1',
        title: 'Producto Base 1',
        description: 'Producto de ejemplo editable para catalogo comercial.',
        price: '$65.000 COP',
        priceNumber: 65000,
        imagePlaceholder: 'P1',
    },
    {
        id: 'producto-2',
        title: 'Producto Base 2',
        description: 'Item de muestra para personalizar nombre, precio y descripcion.',
        price: '$45.000 COP',
        priceNumber: 45000,
        imagePlaceholder: 'P2',
    },
    {
        id: 'producto-3',
        title: 'Producto Base 3',
        description: 'Referencia de inventario lista para adaptar a tu negocio.',
        price: '$38.000 COP',
        priceNumber: 38000,
        imagePlaceholder: 'P3',
    },
    {
        id: 'producto-4',
        title: 'Producto Base 4',
        description: 'Producto de ejemplo orientado a ventas recurrentes.',
        price: '$75.000 COP',
        priceNumber: 75000,
        imagePlaceholder: 'P4',
    },
    {
        id: 'producto-5',
        title: 'Producto Base 5',
        description: 'Muestra final para completar un catalogo inicial de cinco items.',
        price: '$55.000 COP',
        priceNumber: 55000,
        imagePlaceholder: 'P5',
    },
];

export const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
};
