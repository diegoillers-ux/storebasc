'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Truck,
  Package,
  Clock,
  ChevronRight,
  Info,
  DollarSign,
  User,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import FeedbackAlert from '@/components/ui/FeedbackAlert';

interface Order {
  id: string;
  customerId: string;
  status: 'NEW' | 'PAYMENT_PENDING' | 'PAYMENT_SUBMITTED' | 'PAID' | 'PREPARING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shipping: number;
  total: number;
  delivery: 'pickup' | 'shipping';
  address: string | null;
  notes: string | null;
  createdAt: string;
}

interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
}

export default function PedidosPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Selected Order Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  const showNotice = useCallback((type: 'success' | 'error', title: string, message?: string) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resOrders = await fetch('/api/admin/orders');
      const dataOrders = await resOrders.json();
      if (dataOrders.orders) setOrders(dataOrders.orders);

      const resCustomers = await fetch('/api/admin/customers');
      const dataCustomers = await resCustomers.json();
      if (dataCustomers.customers) setCustomers(dataCustomers.customers);

      const resProducts = await fetch('/api/admin/products');
      const dataProducts = await resProducts.json();
      if (dataProducts.products) setProducts(dataProducts.products);
    } catch {
      showNotice('error', 'Error de conexión', 'No se pudieron recuperar los pedidos.');
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);



  const fetchOrderItems = async (orderId: string) => {
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (data.items) {
        setOrderItems(data.items);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudieron cargar los productos del pedido.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, rawStatus: string) => {
    const validStatuses: Order['status'][] = ['NEW', 'PAYMENT_PENDING', 'PAYMENT_SUBMITTED', 'PAID', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(rawStatus as Order['status'])) return;
    const newStatus = rawStatus as Order['status'];
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        showNotice('success', 'Estado actualizado', `Pedido marcado como ${newStatus}.`);
      } else {
        showNotice('error', 'Error al actualizar', data.error);
      }
    } catch {
      showNotice('error', 'Error del sistema', 'No se pudo actualizar el estado del pedido.');
    }
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Cliente Desconocido';
  };

  const getCustomerPhone = (id: string) => {
    return customers.find(c => c.id === id)?.phone || '';
  };

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || 'Producto Desconocido';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Gestión de Pedidos</h1>
        <p className="text-xs text-gray-500 mt-0.5">Control de despachos, logística e-commerce y facturación de productos físicos</p>
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

      {/* Main Grid: Orders list and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Orders Table/List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden divide-y divide-gray-50">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs">
                No hay pedidos de productos registrados.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    fetchOrderItems(order.id);
                  }}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                    selectedOrder?.id === order.id ? 'bg-violet-50/50' : 'hover:bg-gray-50/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0 select-none">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-950 text-sm leading-none">
                        {getCustomerName(order.customerId)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Total: <span className="font-bold text-gray-900">${order.total.toLocaleString('es-CO')} COP</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Entrega: <span className="font-semibold uppercase text-violet-600">{order.delivery === 'pickup' ? 'Recogida local' : 'Envío nacional'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()} // Evitar abrir el panel de detalles
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="text-xs font-semibold bg-[#FAF8FF] border border-gray-100 rounded-xl py-1.5 px-3 outline-none focus:border-violet-300 transition-all text-gray-700 shadow-sm"
                    >
                      <option value="NEW">Nuevo</option>
                      <option value="PAYMENT_PENDING">Pago Pendiente</option>
                      <option value="PAID">Pagado</option>
                      <option value="PREPARING">En Preparación</option>
                      <option value="READY">Listo para Despacho</option>
                      <option value="SHIPPED">Enviado</option>
                      <option value="DELIVERED">Entregado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>

                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Order Detail Drawer */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6 lg:sticky lg:top-8 min-h-[400px]">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Drawer Title */}
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-violet-500" />
                  <h2 className="font-bold text-gray-950 text-base">Detalle de Pedido</h2>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">ID: {selectedOrder.id}</p>
              </div>

              {/* Customer summary */}
              <div className="space-y-2 bg-[#FAF8FF] p-4 rounded-2xl border border-gray-100/30 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-violet-500 shrink-0" />
                  <span className="font-bold">{getCustomerName(selectedOrder.customerId)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare className="w-4 h-4 text-violet-500 shrink-0" />
                  <span>{getCustomerPhone(selectedOrder.customerId)}</span>
                </div>
                {selectedOrder.delivery === 'shipping' && selectedOrder.address && (
                  <div className="flex items-start gap-2 text-gray-500 pt-1.5 border-t border-gray-200/50 mt-1.5">
                    <MapPin className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <span>Dirección: {selectedOrder.address}</span>
                  </div>
                )}
              </div>

              {/* Item Breakout */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productos comprados</h3>
                {loadingItems ? (
                  <div className="py-6 text-center text-xs text-gray-400 animate-pulse">Cargando productos...</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{getProductName(item.productId)}</p>
                          <p className="text-gray-400 mt-0.5">{item.quantity} unidades x ${item.unitPrice.toLocaleString('es-CO')}</p>
                        </div>
                        <span className="font-bold text-gray-950">${item.total.toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order total info */}
              <div className="space-y-2 pt-4 border-t border-gray-50 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Envío:</span>
                  <span>${selectedOrder.shipping.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-950 pt-1.5 border-t border-dashed border-gray-200">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              {/* Status details */}
              <div className="bg-violet-50/50 border border-violet-100/50 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-violet-900">
                <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Estatus Operativo</p>
                  <p className="opacity-90 mt-0.5">El estado del pedido actual es <span className="font-bold">{selectedOrder.status}</span>. Asegura validar el pago antes de despachar el paquete físico.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 h-full text-gray-400 space-y-3 select-none">
              <Package className="w-8 h-8 opacity-40 text-violet-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-gray-500">Ningún Pedido Seleccionado</p>
                <p className="text-[10px] text-gray-400 mt-1">Haz clic en un pedido de la lista para desglosar sus artículos, dirección de entrega y montos.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
