import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';

const ORDER_STATUSES = ['NUEVO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
const PAYMENT_STATUSES = ['PAGO_PENDIENTE', 'ADELANTO_50_CONFIRMADO', 'PAGO_COMPLETO_CONFIRMADO'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const load = () => api.get(`/orders/${id}`).then((res) => setOrder(res.data.order));
  useEffect(() => {
    load();
  }, [id]);

  if (!order) return <p className="text-gray-400">Cargando…</p>;

  const updateOrderStatus = async (orderStatus) => {
    await api.patch(`/orders/${id}/order-status`, { orderStatus });
    load();
  };
  const updatePaymentStatus = async (paymentStatus) => {
    await api.patch(`/orders/${id}/payment-status`, { paymentStatus });
    load();
  };
  const toggleChecklist = async (index) => {
    const checklist = order.checklist.map((c, i) => (i === index ? { ...c, checked: !c.checked } : c));
    setOrder({ ...order, checklist });
    await api.patch(`/orders/${id}/checklist`, { checklist });
  };

  const openPdf = () => {
    const token = localStorage.getItem('admin_token');
    const base = api.defaults.baseURL;
    // Se abre en nueva pestaña; el backend valida el token vía header, así
    // que para un link directo lo pasamos como query param alterno si tu
    // backend lo soporta, o se descarga vía fetch+blob. Aquí usamos fetch.
    fetch(`${base}/orders/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => window.open(URL.createObjectURL(blob), '_blank'));
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">{order.orderNumber}</h1>
        <button className="btn-secondary w-auto px-4" onClick={openPdf}>
          Generar PDF
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Cliente">
          <Row label="De" value={order.fromName} />
          <Row label="Para" value={order.toName} />
          <Row label="Teléfono" value={order.contactPhone} />
        </Card>

        <Card title="Entrega">
          {order.delivery.wanted ? (
            <Row label="Dirección" value={order.delivery.address} />
          ) : (
            <Row label="Punto de entrega" value={`${order.delivery.freeLocationName} (gratis)`} />
          )}
          <Row label="Hora" value={order.delivery.time} />
          <Row label="Referencias" value={order.delivery.references || '-'} />
        </Card>

        <Card title="Productos">
          {order.products.map((p) => (
            <p key={p.name} className="text-sm">
              {p.name} x{p.quantity}
            </p>
          ))}
          {order.companions.map((c) => (
            <p key={c.name} className="text-sm">
              {c.name} x{c.quantity} (acompañante)
            </p>
          ))}
        </Card>

        <Card title="Caja y decoración">
          <p className="text-sm">{order.box.name}</p>
          {order.decorations.map((d) => (
            <p key={d.name} className="text-sm">
              {d.name}
            </p>
          ))}
        </Card>

        <Card title="Personalización">
          <Row label="Temática" value={order.customization.theme || '-'} />
          <Row label="Colores" value={order.customization.predominantColors || '-'} />
          <Row label="Dedicatoria" value={order.customization.hasDedication ? order.customization.dedicationText : 'No'} />
          <Row label="Tarjeta" value={order.customization.cardStyleDescription || '-'} />
        </Card>

        <Card title="Precio">
          <Row label="Costo base" value={`S/ ${order.pricing.baseCost.toFixed(2)}`} />
          <Row label="Ganancia" value={`${order.pricing.profitPercentageAtOrder}% → S/ ${order.pricing.profitAmount.toFixed(2)}`} />
          <Row label="Precio box" value={`S/ ${order.pricing.boxPrice.toFixed(2)}`} />
          <Row label="Delivery" value={`S/ ${order.pricing.deliveryCostAtOrder.toFixed(2)}`} />
          <Row label="TOTAL" value={`S/ ${order.pricing.finalPrice.toFixed(2)}`} bold />
        </Card>

        <Card title="Estado del pedido">
          <select className="input-field" value={order.orderStatus} onChange={(e) => updateOrderStatus(e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </Card>

        <Card title="Estado de pago">
          <select className="input-field" value={order.paymentStatus} onChange={(e) => updatePaymentStatus(e.target.value)}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-2">Adelanto 50%: S/ {order.advanceAmount.toFixed(2)}</p>
        </Card>
      </div>

      <Card title="Checklist de preparación">
        <div className="grid grid-cols-2 gap-2">
          {order.checklist.map((c, i) => (
            <label key={c.label + i} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4 accent-rose-600" checked={c.checked} onChange={() => toggleChecklist(i)} />
              {c.label}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 md:mb-0">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={bold ? 'font-bold text-rose-600' : ''}>{value}</span>
    </div>
  );
}
