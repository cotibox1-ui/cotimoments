import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const ORDER_STATUSES = ['NUEVO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
const PAYMENT_STATUSES = ['PAGO_PENDIENTE', 'ADELANTO_50_CONFIRMADO', 'PAGO_COMPLETO_CONFIRMADO'];

export default function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (orderStatus) params.orderStatus = orderStatus;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    api
      .get('/orders', { params })
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderStatus, paymentStatus]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Pedidos</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="input-field w-auto" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select className="input-field w-auto" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">Todos los pagos</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">No hay pedidos con estos filtros.</p>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/admin/pedidos/${o._id}`}
              className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-gray-400">
                  {o.fromName} → {o.toName} · {new Date(o.createdAt).toLocaleString('es-PE')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-rose-600">S/ {o.pricing.finalPrice.toFixed(2)}</p>
                <div className="flex gap-1 justify-end mt-1">
                  <Badge>{o.orderStatus}</Badge>
                  <Badge>{o.paymentStatus.split('_')[0]}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ children }) {
  return <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{children}</span>;
}
