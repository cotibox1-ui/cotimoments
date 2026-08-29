import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileDown, Trash2 } from 'lucide-react';
import api from '../../api/client';

const ORDER_STATUSES = ['NUEVO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
const PAYMENT_STATUSES = ['PAGO_PENDIENTE', 'ADELANTO_50_CONFIRMADO', 'PAGO_COMPLETO_CONFIRMADO'];
const DELETABLE_STATUSES = ['ENTREGADO', 'CANCELADO'];

const ORDER_BADGE_STYLE = {
  NUEVO: 'bg-blue-50 text-blue-600',
  CONFIRMADO: 'bg-indigo-50 text-indigo-600',
  EN_PREPARACION: 'bg-amber-50 text-amber-600',
  LISTO: 'bg-emerald-50 text-emerald-600',
  EN_CAMINO: 'bg-purple-50 text-purple-600',
  ENTREGADO: 'bg-gray-100 text-gray-500',
  CANCELADO: 'bg-red-50 text-red-500',
};
const PAYMENT_BADGE_STYLE = {
  PAGO_PENDIENTE: 'bg-red-50 text-red-500',
  ADELANTO_50_CONFIRMADO: 'bg-amber-50 text-amber-600',
  PAGO_COMPLETO_CONFIRMADO: 'bg-emerald-50 text-emerald-600',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const load = () => api.get(`/orders/${id}`).then((res) => setOrder(res.data.order));
  useEffect(() => {
    load();
  }, [id]);

  if (!order) return <p className="text-ink-400">Cargando…</p>;

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

  const deleteOrder = async () => {
    if (!confirm(`¿Eliminar el pedido ${order.orderNumber}? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/orders/${id}`);
      navigate('/admin');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'No se pudo eliminar el pedido.');
      setDeleting(false);
    }
  };

  const downloadPdf = async () => {
    setPdfError('');
    setDownloadingPdf(true);
    try {
      const token = localStorage.getItem('admin_token');
      const base = api.defaults.baseURL;
      const res = await fetch(`${base}/orders/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('No se pudo generar el PDF.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Se dispara una descarga real (no solo "abrir"), que es lo que
      // funciona de forma confiable tanto en el navegador como dentro de
      // la APK (un WebView no siempre puede mostrar un PDF en pestaña
      // nueva, pero sí puede guardarlo).
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError('No se pudo descargar el PDF. Intenta de nuevo.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="lg:max-w-5xl">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Detalle del pedido</h1>
          <p className="text-rose-600 font-semibold text-sm mt-0.5">{order.orderNumber}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {DELETABLE_STATUSES.includes(order.orderStatus) && (
            <button
              className="w-10 h-10 rounded-2xl border border-red-200 text-red-500 flex items-center justify-center active:scale-95 transition disabled:opacity-40"
              onClick={deleteOrder}
              disabled={deleting}
              title="Eliminar pedido"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          <button className="btn-secondary w-auto px-4 flex items-center gap-2 disabled:opacity-50" onClick={downloadPdf} disabled={downloadingPdf}>
            <FileDown className="w-4 h-4" strokeWidth={2} />
            {downloadingPdf ? 'Descargando…' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      {pdfError && <p className="text-sm text-red-600 mb-3">{pdfError}</p>}

      {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}

      <div className="flex gap-2 mb-5">
        <span className={`badge ${PAYMENT_BADGE_STYLE[order.paymentStatus]}`}>{order.paymentStatus.replace(/_/g, ' ')}</span>
        <span className={`badge ${ORDER_BADGE_STYLE[order.orderStatus]}`}>{order.orderStatus.replace('_', ' ')}</span>
      </div>

      {order.referenceImageUrl && (
        <div className="rounded-2xl overflow-hidden h-40 lg:h-52 bg-rose-50 mb-4">
          <img src={order.referenceImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card title="Cliente">
          <Row label="De" value={order.fromName} />
          <Row label="Teléfono de quien envía" value={order.fromPhone} />
          <Row label="Para" value={order.toName} />
          <Row label="Teléfono de quien recibe" value={order.toPhone} />
        </Card>

        <Card title="Entrega">
          <Row
            label="Zona"
            value={
              order.pricing.deliveryCostAtOrder > 0
                ? `${order.delivery.zoneName} (S/ ${order.pricing.deliveryCostAtOrder.toFixed(2)})`
                : `${order.delivery.zoneName} (gratis)`
            }
          />
          {order.pricing.deliveryCostAtOrder > 0 && <Row label="Dirección" value={order.delivery.address} />}
          <Row label="Hora" value={order.delivery.time} />
          <Row label="Referencias" value={order.delivery.references || '-'} />
        </Card>

        <Card title="Productos">
          {order.products.map((p) => (
            <p key={p.name} className="text-sm text-ink-600">
              {p.name} <span className="text-ink-400">x{p.quantity}</span>
            </p>
          ))}
          {order.companions.map((c) => (
            <p key={c.name} className="text-sm text-ink-600">
              {c.name} <span className="text-ink-400">x{c.quantity} (acompañante)</span>
            </p>
          ))}
        </Card>

        <Card title="Caja y decoración">
          <p className="text-sm text-ink-600">{order.box.name}</p>
          {order.decorations.map((d) => (
            <p key={d.name} className="text-sm text-ink-600">
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
          <p className="text-xs text-ink-400 mt-2">Adelanto 50%: S/ {order.advanceAmount.toFixed(2)}</p>
        </Card>
      </div>

      <Card title="Checklist de preparación">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          {order.checklist.map((c, i) => (
            <label
              key={c.label + i}
              className={`flex items-center gap-2 text-sm rounded-xl px-2.5 py-2 transition-colors ${
                c.checked ? 'bg-rose-50 text-ink-400 line-through' : 'text-ink-600'
              }`}
            >
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
    <div className="card p-4">
      <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-400">{label}</span>
      <span className={bold ? 'font-bold text-rose-600' : 'text-ink-900'}>{value}</span>
    </div>
  );
}
