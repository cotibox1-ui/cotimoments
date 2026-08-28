import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import api from '../../api/client';
import StepIndicator from '../../components/StepIndicator';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepConfirmation() {
  const navigate = useNavigate();
  const { state, reset } = useBoxBuilder();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  const buildSelection = () => ({
    products: state.products.map((p) => ({ productId: p.productId, quantity: p.quantity })),
    companions: state.companions.map((c) => ({ productId: c.productId, quantity: c.quantity })),
    boxId: state.boxId,
    decorationIds: state.decorationIds,
    deliveryWanted: state.delivery.wanted,
  });

  // El precio que se ve aquí viene del backend (mismo motor que usa al
  // crear el pedido) — nunca se calcula en el frontend. Es solo una VISTA
  // PREVIA: el pedido real vuelve a calcularse al confirmar.
  useEffect(() => {
    setLoadingPrice(true);
    setError('');
    api
      .post('/orders/preview-pricing', buildSelection())
      .then((res) => setPricing(res.data.pricing))
      .catch((err) => setError(err.response?.data?.error || 'No se pudo calcular el precio.'))
      .finally(() => setLoadingPrice(false));
  }, []);

  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        fromName: state.delivery.fromName,
        toName: state.delivery.toName,
        contactPhone: state.delivery.contactPhone,
        ...buildSelection(),
        deliveryAddress: state.delivery.address,
        deliveryTime: state.delivery.time,
        deliveryReferences: state.delivery.references,
        customization: state.customization,
      };
      // El precio mostrado arriba NUNCA se envía al backend: el backend lo
      // recalcula desde cero con calculateOrderPricing() al crear el pedido.
      const res = await api.post('/orders', payload);
      reset();
      navigate(`/pedido/${res.data.order.orderNumber}`);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-rose-25">
      <StepIndicator current={6} />

      {state.boxPhotoUrl && (
        <div className="h-40 bg-rose-50">
          <img src={state.boxPhotoUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="text-center mb-1">
          <h2 className="font-display text-2xl font-bold text-ink-900">Tu box está listo</h2>
          <p className="text-sm text-ink-400">Revisa todo antes de confirmar</p>
        </div>

        <Section title="Productos">
          <div className="grid grid-cols-3 gap-2">
            {state.products.map((p) => (
              <ThumbItem key={p.productId} photoUrl={p.photoUrl} name={p.name} quantity={p.quantity} />
            ))}
          </div>
        </Section>

        {state.companions.length > 0 && (
          <Section title="Acompañantes">
            <div className="grid grid-cols-3 gap-2">
              {state.companions.map((c) => (
                <ThumbItem key={c.productId} photoUrl={c.photoUrl} name={c.name} quantity={c.quantity} />
              ))}
            </div>
          </Section>
        )}

        <Section title="Caja">
          <div className="grid grid-cols-3 gap-2">
            <ThumbItem photoUrl={state.boxPhotoUrl} name={state.boxName} />
          </div>
        </Section>

        <Section title="Personalización">
          <p className="text-sm text-ink-600">
            <span className="text-ink-400">Temática:</span> {state.customization.theme}
          </p>
          <p className="text-sm text-ink-600">
            <span className="text-ink-400">Colores:</span> {state.customization.predominantColors}
          </p>
          {state.customization.hasDedication && (
            <p className="text-sm text-ink-600">
              <span className="text-ink-400">Dedicatoria:</span> {state.customization.dedicationText}
            </p>
          )}
        </Section>

        <Section title="Entrega">
          <p className="text-sm text-ink-600">
            De: <span className="font-medium">{state.delivery.fromName}</span> → Para:{' '}
            <span className="font-medium">{state.delivery.toName}</span>
          </p>
          <p className="text-sm text-ink-600">{state.delivery.wanted ? state.delivery.address : 'Punto de recojo gratuito'}</p>
          <p className="text-sm text-ink-600">Hora: {state.delivery.time}</p>
        </Section>

        {/* ---- PRECIO: única pantalla donde se muestra, con protagonismo ---- */}
        <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-soft overflow-hidden">
          <div className="px-5 py-4">
            {loadingPrice ? (
              <p className="text-center text-sm text-ink-400 py-4">Calculando tu precio…</p>
            ) : pricing ? (
              <>
                <PriceRow label="Costo base" value={pricing.baseCost} />
                <PriceRow label={`Ganancia (${pricing.profitPercentageAtOrder}%)`} value={pricing.profitAmount} />
                <PriceRow label="Precio del box" value={pricing.boxPrice} />
                <PriceRow label="Delivery" value={pricing.deliveryCostAtOrder} />
                <div className="flex items-baseline justify-between pt-3 mt-2 border-t border-rose-100">
                  <span className="font-display text-lg font-bold text-ink-900">TOTAL</span>
                  <span className="font-display text-3xl font-bold text-rose-600">S/ {pricing.finalPrice.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-red-600 py-4">{error || 'No se pudo calcular el precio.'}</p>
            )}
          </div>
        </div>

        {error && pricing && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-rose-50 p-4 flex gap-3">
        <button className="btn-secondary" onClick={() => navigate('/armar-box/entrega')} disabled={submitting}>
          Atrás
        </button>
        <button className="btn-primary" onClick={confirm} disabled={submitting || loadingPrice || !pricing}>
          {submitting ? 'Creando pedido…' : 'CONFIRMAR PEDIDO'}
        </button>
      </div>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-sm text-ink-400">{label}</span>
      <span className="text-sm font-medium text-ink-900">S/ {value.toFixed(2)}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1.5">{title}</p>
      {children}
    </div>
  );
}

function ThumbItem({ photoUrl, name, quantity }) {
  return (
    <div className="text-center">
      <div className="w-full aspect-square rounded-xl bg-rose-50 flex items-center justify-center overflow-hidden mb-1 p-1.5">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="w-full h-full rounded-lg bg-white border border-dashed border-rose-200 flex items-center justify-center">
            <span className="text-[9px] text-rose-200">Sin foto</span>
          </div>
        )}
      </div>
      <p className="text-xs font-medium leading-tight text-ink-900">
        {name}
        {quantity ? ` x${quantity}` : ''}
      </p>
    </div>
  );
}
