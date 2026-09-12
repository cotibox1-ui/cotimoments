import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  PackageSearch,
  Clock,
  Wallet,
  CheckCircle2,
  ChefHat,
  Sparkles,
  Truck,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import api from '../../api/client';
import { copyToClipboard } from '../../utils/clipboard';
import { shareLink } from '../../utils/share';

const ORDER_STATUSES = ['NUEVO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
const PAYMENT_STATUSES = ['PAGO_PENDIENTE', 'ADELANTO_50_CONFIRMADO', 'PAGO_COMPLETO_CONFIRMADO'];

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

export default function OrdersDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // sin filtrar, solo para las tarjetas estadísticas
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [copiedBuildLink, setCopiedBuildLink] = useState(false);
  const [copyLinkError, setCopyLinkError] = useState(false);
  const [copyDebugDetail, setCopyDebugDetail] = useState('');

  useEffect(() => {
    api.get('/orders').then((res) => setAllOrders(res.data.orders));
  }, []);

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

  const count = (predicate) => allOrders.filter(predicate).length;
  const stats = [
    { label: 'Nuevos', value: count((o) => o.orderStatus === 'NUEVO'), icon: PackageSearch, color: 'blue' },
    { label: 'Pendientes de pago', value: count((o) => o.paymentStatus === 'PAGO_PENDIENTE'), icon: Clock, color: 'red' },
    { label: 'Adelantos 50%', value: count((o) => o.paymentStatus === 'ADELANTO_50_CONFIRMADO'), icon: Wallet, color: 'amber' },
    { label: 'Pagos completos', value: count((o) => o.paymentStatus === 'PAGO_COMPLETO_CONFIRMADO'), icon: CheckCircle2, color: 'emerald' },
    { label: 'En preparación', value: count((o) => o.orderStatus === 'EN_PREPARACION'), icon: ChefHat, color: 'amber' },
    { label: 'Listos', value: count((o) => o.orderStatus === 'LISTO'), icon: Sparkles, color: 'emerald' },
    { label: 'En camino', value: count((o) => o.orderStatus === 'EN_CAMINO'), icon: Truck, color: 'purple' },
  ];

  // Dentro de la APK, "window.location.origin" es una URL interna
  // (https://localhost), no el dominio real — por eso se usa
  // VITE_PUBLIC_URL cuando la app corre como APK.
  const publicBaseUrl = Capacitor.isNativePlatform()
    ? import.meta.env.VITE_PUBLIC_URL
    : window.location.origin;
  const buildLink = publicBaseUrl ? `${publicBaseUrl}/armar-box` : null;

  const copyBuildLink = async () => {
    if (!buildLink) return;
    const result = await copyToClipboard(buildLink);
    setCopyDebugDetail(result.detail);
    if (result.ok) {
      setCopyLinkError(false);
      setCopiedBuildLink(true);
      setTimeout(() => setCopiedBuildLink(false), 2000);
    } else {
      setCopyLinkError(true);
    }
  };

  const shareBuildLink = async () => {
    if (!buildLink) return;
    const result = await shareLink({ title: 'Arma tu box', url: buildLink });
    if (result === 'copied') {
      setCopyLinkError(false);
      setCopiedBuildLink(true);
      setTimeout(() => setCopiedBuildLink(false), 2000);
    } else if (result === 'failed') {
      setCopyLinkError(true);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
        <div className="flex gap-2">
          <button
            className="btn-secondary sm:w-auto sm:px-4 flex items-center justify-center gap-1.5"
            onClick={copyBuildLink}
            disabled={!buildLink}
            title={buildLink || 'Configura VITE_PUBLIC_URL para habilitar este botón'}
          >
            {copiedBuildLink ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
            {copiedBuildLink ? '¡Copiado!' : 'Copiar'}
          </button>
          <button
            className="btn-primary sm:w-auto sm:px-4 flex items-center justify-center gap-1.5"
            onClick={shareBuildLink}
            disabled={!buildLink}
            title={buildLink || 'Configura VITE_PUBLIC_URL para habilitar este botón'}
          >
            <Share2 className="w-4 h-4" strokeWidth={2} />
            Compartir link para armar box
          </button>
        </div>
      </div>
      {copyLinkError ? (
        <p className="text-xs text-red-600 mb-1">
          No se pudo copiar automáticamente. Selecciona y copia este link a mano:{' '}
          <span className="font-mono select-all bg-red-50 px-1 rounded">{buildLink}</span>
        </p>
      ) : (
        <div className="mb-3" />
      )}
      {copyDebugDetail && (
        <p className="text-[10px] text-ink-400 mb-3">
          Detalle técnico (para diagnóstico): {copyDebugDetail}
        </p>
      )}

      {/* ---- TARJETAS ESTADÍSTICAS (sección 14): una fila completa en desktop ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="xl:grid xl:grid-cols-3 xl:gap-6 xl:items-start">
        <div className="xl:col-span-2">
          <h2 className="font-semibold text-ink-900 mb-3">Pedidos recientes</h2>
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
            <p className="text-ink-400">Cargando…</p>
          ) : orders.length === 0 ? (
            <p className="text-ink-400">No hay pedidos con estos filtros.</p>
          ) : (
            <>
              {/* ---- Tabla (sección 15), solo en pantallas medianas en adelante ---- */}
              <div className="hidden sm:block card overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rose-100 text-left text-xs text-ink-400 uppercase tracking-wide">
                      <th className="px-4 py-3 font-semibold">N° Pedido</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Cliente</th>
                      <th className="px-4 py-3 font-semibold">Destinatario</th>
                      <th className="px-4 py-3 font-semibold text-right">Total</th>
                      <th className="px-4 py-3 font-semibold">Pago</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o._id}
                        onClick={() => navigate(`/admin/pedidos/${o._id}`)}
                        className="border-b border-rose-50 last:border-0 hover:bg-rose-25 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-ink-900 whitespace-nowrap">{o.orderNumber}</td>
                        <td className="px-4 py-3 text-ink-400 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('es-PE')}</td>
                        <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{o.fromName}</td>
                        <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{o.toName}</td>
                        <td className="px-4 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                          S/ {o.pricing.finalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`badge ${PAYMENT_BADGE_STYLE[o.paymentStatus]}`}>
                            {o.paymentStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`badge ${ORDER_BADGE_STYLE[o.orderStatus]}`}>{o.orderStatus.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ---- Tarjetas táctiles, solo en móvil ---- */}
              <div className="sm:hidden grid gap-3">
                {orders.map((o) => (
                  <Link
                    key={o._id}
                    to={`/admin/pedidos/${o._id}`}
                    className="card p-4 flex items-center justify-between active:scale-[0.99] transition"
                  >
                    <div>
                      <p className="font-semibold text-ink-900">{o.orderNumber}</p>
                      <p className="text-xs text-ink-400">
                        {o.fromName} → {o.toName} · {new Date(o.createdAt).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-600">S/ {o.pricing.finalPrice.toFixed(2)}</p>
                      <div className="flex gap-1 justify-end mt-1">
                        <span className={`badge ${ORDER_BADGE_STYLE[o.orderStatus]}`}>{o.orderStatus.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ---- Panel "Pedidos por estado" — solo visible en pantallas grandes (sección 5) ---- */}
        <div className="hidden xl:block card p-5 mt-[52px]">
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-3">Pedidos por estado</p>
          <div className="space-y-1">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${STAT_COLOR[s.color]}`}>
                    <s.icon className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-ink-600">{s.label}</span>
                </div>
                <span className="text-sm font-semibold text-ink-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STAT_COLOR = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-500',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
};

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${STAT_COLOR[color]}`}>
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xl font-bold text-ink-900 leading-none">{value}</p>
        <p className="text-[11px] text-ink-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
