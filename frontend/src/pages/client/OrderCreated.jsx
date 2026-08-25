import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
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
    <div className="min-h-screen px-6 py-10 flex flex-col items-center text-center bg-rose-50">
      <h1 className="font-display text-2xl font-bold text-rose-600 mb-2 flex items-center justify-center gap-2">
        <PartyPopper className="w-6 h-6" strokeWidth={1.75} />
        ¡Tu pedido ha sido creado!
      </h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        Para iniciar la preparación de tu box, realiza el pago completo o un adelanto del 50%.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 w-full max-w-sm space-y-2 text-left">
        <Row label="Número de pedido" value={order.orderNumber} />
        <Row label="Total" value={`S/ ${order.pricing.finalPrice.toFixed(2)}`} />
        <Row label="Adelanto 50%" value={`S/ ${order.advanceAmount.toFixed(2)}`} />
      </div>

      {config?.payment?.instructions ? (
        <div className="bg-rose-50 rounded-2xl p-4 mt-4 w-full max-w-sm text-sm text-gray-700">
          {config.payment.instructions}
        </div>
      ) : null}

      {waLink ? (
        <a href={waLink} target="_blank" rel="noreferrer" className="btn-primary max-w-sm mt-6 flex items-center justify-center">
          ENVIAR COMPROBANTE POR WHATSAPP
        </a>
      ) : (
        <p className="text-xs text-gray-400 mt-6">
          El número de WhatsApp del negocio aún no está configurado. Contáctanos directamente.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
