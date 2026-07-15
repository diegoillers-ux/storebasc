export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Panel de Ananda</h1>
      <p className="text-gray-500 text-sm mb-8">Tu operación centralizada ✨</p>

      {/* TODO Sprint 2: Métricas, agenda del día, pendientes y ventas recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Sesiones hoy" value="—" sub="Pendientes de configuración" />
        <MetricCard title="Pagos por verificar" value="—" sub="" />
        <MetricCard title="Ingresos del mes" value="—" sub="" />
        <MetricCard title="Clientes nuevos" value="—" sub="" />
      </div>
    </div>
  )
}

function MetricCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
