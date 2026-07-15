import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { productRepository } from '@/lib/firebase/repositories/products';

const MOCK_PRODUCTS = [
  { id: 'prod-1', name: 'Sahumerio Sagrado de Copal', slug: 'sahumerio-copal', price: 35000, stock: 12, sku: 'SAH-COP-01', category: 'Sahumerios', active: true, featured: true, description: 'Varitas de copal silvestre y resinas aromáticas para purificación energética de espacios.', imageUrl: null },
  { id: 'prod-2', name: 'Kit de Cristales de Cuarzo Rosa', slug: 'kit-cuarzo-rosa', price: 45000, stock: 2, sku: 'CRI-ROS-02', category: 'Piedras y Cristales', active: true, featured: false, description: 'Cristales de cuarzo rosa seleccionados a mano para atraer el amor incondicional y la paz interior.', imageUrl: null },
  { id: 'prod-3', name: 'Aceite Esencial de Sándalo Astral', slug: 'aceite-sandalo', price: 28000, stock: 0, sku: 'ACE-SAN-03', category: 'Aceites', active: true, featured: false, description: 'Extracto natural de sándalo consagrado en luna llena para inducir estados meditativos profundos.', imageUrl: null },
];

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ products: MOCK_PRODUCTS });
    }

    const products = await productRepository.list(false); // Listar todos, incluyendo inactivos
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al obtener productos.', details }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, slug, price, stock, sku, category, imageUrl, active, featured, description } = body;

    if (!name || !slug || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'Producto simulado creado.',
        product: { id: 'demo-' + Math.random(), ...body },
      });
    }

    const newProduct = await productRepository.create({
      name,
      slug,
      price: Number(price),
      stock: Number(stock),
      currency: 'COP',
      sku: sku || null,
      category: category || null,
      imageUrl: imageUrl || null,
      images: [],
      active: active !== undefined ? active : true,
      featured: featured !== undefined ? featured : false,
      description: description || null,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error al crear producto.', details }, { status: 500 });
  }
}
