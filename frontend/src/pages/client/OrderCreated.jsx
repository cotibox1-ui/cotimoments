import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import api from '../../api/client';

// lucide-react no incluye logos de marcas — se usa el ícono oficial de
// WhatsApp en SVG para que el botón sea reconocible de un vistazo.
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.94.541 3.845 1.567 5.5L2.06 22l4.61-1.489a9.96 9.96 0 0 0 5.334 1.542h.004c5.518 0 10.004-4.486 10.004-10.004S17.522 2 12.004 2zm0 18.09h-.003a8.06 8.06 0 0 1-4.108-1.126l-.295-.175-3.052.986.99-2.976-.192-.305a8.06 8.06 0 0 1-1.24-4.29c0-4.456 3.626-8.083 8.09-8.083 2.16 0 4.19.842 5.72 2.373a8.037 8.037 0 0 1 2.37 5.72c0 4.456-3.626 8.083-8.09 8.083z" />
    </svg>
  );
}

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
        <>
          <p className="text-sm font-semibold text-ink-900 mt-6 mb-2">Adjunta tu comprobante de pago</p>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="max-w-sm w-full bg-[#25D366] hover:bg-[#1fb959] text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-all duration-150 shadow-soft flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="w-5 h-5" />
            ENVIAR COMPROBANTE POR WHATSAPP
          </a>
        </>
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
