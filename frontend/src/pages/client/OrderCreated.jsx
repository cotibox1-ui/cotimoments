import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PartyPopper, MessageCircle } from 'lucide-react';
import api from '../../api/client';

export default function OrderCreated() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/orders/${orderNumber}/public`)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError('No se encontró el pedido.'));
    api.get('/configuration/public').then((res) => setConfig(res.data));
  }, [orderNumber]);

  if (error) return <p className="text-center text-red-600 py-20">{error}</p>;
  if (!order) return <p className="text-center text-gray-400 py-20">Cargando…</p>;

  const businessNumber = config?.whatsapp?.phoneNumber || '';
  const waMessage = encodeURIComponent(
    `Hola, envío el comprobante de pago de mi pedido ${order.orderNumber}.\n\n` +
      `De: ${order.fromName}\nPara: ${order.toName}\nTotal: S/ ${order.pricing.finalPrice.toFixed(2)}`
  );
  const waLink = businessNumber ? `https://wa.me/${businessNumber}?text=${waMessage}` : null;

  return (
    <div className="min-h-screen px-6 py-10 lg:py-16 flex flex-col items-center text-center bg-rose-25">
      <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
        <PartyPopper className="w-7 h-7 text-rose-600" strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-1">¡Tu pedido ha sido creado!</h1>
      <p className="text-rose-600 font-semibold text-sm mb-1">{order.orderNumber}</p>
      <p className="text-ink-400 mb-6 max-w-sm text-sm leading-relaxed">
        Para iniciar la preparación de tu box, realiza el pago completo o un adelanto del 50%.
      </p>

      <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-soft p-5 w-full max-w-sm space-y-2 text-left">
        <Row label="Total" value={`S/ ${order.pricing.finalPrice.toFixed(2)}`} big />
        <Row label="Adelanto 50%" value={`S/ ${order.advanceAmount.toFixed(2)}`} />
      </div>

      {config?.payment?.instructions ? (
        <div className="bg-rose-50 rounded-2xl p-4 mt-4 w-full max-w-sm text-sm text-ink-600 leading-relaxed">
          {config.payment.instructions}
        </div>
      ) : null}

      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="btn-primary max-w-sm mt-6 flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" strokeWidth={2} />
          ENVIAR COMPROBANTE POR WHATSAPP
        </a>
      ) : (
        <p className="text-xs text-ink-400 mt-6">
          El número de WhatsApp del negocio aún no está configurado. Contáctanos directamente.
        </p>
      )}
    </div>
  );
}

function Row({ label, value, big }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-sm text-ink-400">{label}</span>
      <span className={big ? 'font-display text-2xl font-bold text-rose-600' : 'text-sm font-semibold text-ink-900'}>
        {value}
      </span>
    </div>
  );
}
