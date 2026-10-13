'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  Search,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Tag,
  Settings,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string | null;
  category: string | null;
  imageUrl: string | null;
  active: boolean;
  featured: boolean;
}

export default function CatalogoPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);

  // Stock Adjustment state
  const [stockChange, setStockChange] = useState<number>(1);
  const [stockReason, setStockReason] = useState<string>('ajuste');

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudieron recuperar los productos del catálogo.');
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // ─── Producto CRUD ───

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct({
        name: '',
        slug: '',
        price: 35000,
        stock: 10,
        sku: '',
        category: 'Esoterismo',
        active: true,
        featured: false,
        imageUrl: '',
        description: '',
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name || !currentProduct.slug) return;

    try {
      const method = currentProduct.id ? 'PUT' : 'POST';
      const url = currentProduct.id ? `/api/admin/products/${currentProduct.id}` : '/api/admin/products';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProduct),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Producto guardado', 'Catálogo de e-commerce actualizado correctamente.');
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        showNotice('error', 'Error al guardar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo guardar el producto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas retirar este producto físico del catálogo?')) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Producto eliminado', 'El producto ha sido eliminado.');
        fetchProducts();
      } else {
        showNotice('error', 'Error al eliminar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo eliminar el producto.');
    }
  };

  // ─── Ajuste Transaccional de Stock ───

  const handleOpenStockModal = (product: Product) => {
    setCurrentProduct(product);
    setStockChange(1);
    setStockReason('ajuste');
    setIsStockModalOpen(true);
  };

  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.id) return;

    try {
      const res = await fetch(`/api/admin/products/${currentProduct.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change: stockChange,
          reason: stockReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Ajuste procesado', 'El inventario físico ha sido modificado y auditado.');
        setIsStockModalOpen(false);
        fetchProducts();
      } else {
        showNotice('error', 'Ajuste fallido', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo procesar la transacción de stock.');
    }
  };

  const filteredProducts = products.filter((p) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (loading) {
    return <LoadingState message="Cargando catálogo de productos físicos..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Catálogo de Productos</h1>
          <p className="text-xs text-gray-500 mt-0.5">Control de productos esotéricos, inventario y movimientos de stock</p>
        </div>

        <button
          onClick={() => handleOpenProductModal()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Producto</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alert && (
        <FeedbackAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search and Filters */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Buscar por nombre de producto o SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-300 transition-all text-gray-700 placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs col-span-full bg-white border border-gray-100 rounded-3xl">
            No se encontraron productos en el catálogo.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock < 5;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-3xl p-6 shadow-premium border transition-all duration-300 flex flex-col justify-between ${
                  product.active ? 'border-gray-100 hover:shadow-premium-hover' : 'border-dashed border-gray-300 bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold bg-[#FAF8FF] text-violet-600 border border-violet-100 px-2 py-0.5 rounded-md uppercase">
                        {product.category || 'Varios'}
                      </span>
                      <h3 className="font-bold text-gray-950 text-base mt-2 leading-tight">
                        {product.name}
                      </h3>
                      {product.sku && (
                        <p className="text-[10px] font-mono text-gray-400 mt-1">SKU: {product.sku}</p>
                      )}
                    </div>

                    {/* Stock level badge */}
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 border select-none ${
                      isOutOfStock
                        ? 'bg-coral-50 text-coral-600 border-coral-100'
                        : isLowStock
                        ? 'bg-gold-50 text-gold-500 border-gold-100'
                        : 'bg-teal-50 text-teal-600 border-teal-100'
                    }`}>
                      {isOutOfStock ? 'Agotado' : isLowStock ? `${product.stock} (Bajo Stock)` : `${product.stock} Disp.`}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-500 leading-relaxed truncate-2 h-9 mb-4">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold leading-none uppercase">Precio</p>
                    <p className="text-sm font-extrabold text-gray-950 mt-1">
                      ${product.price.toLocaleString('es-CO')} COP
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenStockModal(product)}
                      className="flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100/60 px-3 py-1.5 rounded-xl border border-violet-100/30 transition-all"
                      title="Ajuste rápido de stock"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Stock</span>
                    </button>
                    <button
                      onClick={() => handleOpenProductModal(product)}
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-[#FAF8FF] rounded-lg transition-all"
                      title="Editar producto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id!)}
                      className="p-2 text-gray-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-all"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── MODAL: CREAR/EDITAR PRODUCTO ─── */}
      {isProductModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-[#1A0F3D]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-premium border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-950 text-base">
                {currentProduct.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  placeholder="Ej. Sahumerio Sagrado de Copal"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug (Identificador URL)</label>
                <input
                  type="text"
                  required
                  value={currentProduct.slug}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="ej. sahumerio-copal"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Precio (COP)</label>
                  <input
                    type="number"
                    required
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    placeholder="35000"
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Inventario Inicial</label>
                  <input
                    type="number"
                    required
                    disabled={!!currentProduct.id} // El stock de productos existentes se ajusta mediante el modal de stock transaccional
                    value={currentProduct.stock}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                    placeholder="10"
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">SKU (Código único)</label>
                  <input
                    type="text"
                    value={currentProduct.sku || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                    placeholder="SAH-COP-01"
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Categoría</label>
                  <select
                    value={currentProduct.category || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                    className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                  >
                    <option value="Esoterismo">Esoterismo</option>
                    <option value="Sahumerios">Sahumerios</option>
                    <option value="Piedras y Cristales">Piedras y Cristales</option>
                    <option value="Aceites">Aceites</option>
                    <option value="Varios">Varios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">URL de Imagen</label>
                <input
                  type="text"
                  value={currentProduct.imageUrl || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción</label>
                <textarea
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  placeholder="Detalles sobre el origen del producto, ingredientes o uso espiritual..."
                  rows={3}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 text-xs text-gray-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentProduct.active}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, active: e.target.checked })}
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                  />
                  <span>Producto Activo en Tienda</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Producto</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: AJUSTE DE STOCK TRANSACCIONAL ─── */}
      {isStockModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-[#1A0F3D]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-premium border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-950 text-base">Ajustar Inventario</h3>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <p className="text-gray-500">Producto: <span className="font-bold text-gray-900">{currentProduct.name}</span></p>
                <p className="text-gray-500 mt-1">Stock actual: <span className="font-bold text-gray-900">{currentProduct.stock} unidades</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cantidad del Ajuste</label>
                <input
                  type="number"
                  required
                  value={stockChange}
                  onChange={(e) => setStockChange(Number(e.target.value))}
                  placeholder="Ej. +10 o -5"
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                />
                <p className="text-[10px] text-gray-400 mt-1">Usa valores positivos para sumar (entradas) y negativos para restar (salidas).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Motivo del Ajuste</label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full bg-[#FAF8FF] border border-gray-100 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-violet-300 transition-all text-gray-700"
                >
                  <option value="ajuste">Ajuste manual administrativo</option>
                  <option value="inicial">Carga inicial</option>
                  <option value="proveedor">Compra/Entrada de proveedor</option>
                  <option value="venta">Salida por venta física</option>
                  <option value="merma">Salida por daño / rotura / merma</option>
                  <option value="muestra">Salida por regalo / muestra de cortesía</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2D1B69] hover:bg-[#1A0F3D] text-white py-3 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar Ajuste Auditado</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
