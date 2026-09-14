import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { isDemoMode } from '@/lib/demoMode';
import { productRepository } from '@/lib/supabase/repositories/products';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    if (isDemoMode()) {
      return NextResponse.json({ products: [] });
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
