import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StepIndicator from '../../components/StepIndicator';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepConfirmation() {
  const navigate = useNavigate();
  const { state, reset } = useBoxBuilder();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        fromName: state.delivery.fromName,
        toName: state.delivery.toName,
        contactPhone: state.delivery.contactPhone,
        products: state.products.map((p) => ({ productId: p.productId, quantity: p.quantity })),
        companions: state.companions.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        boxId: state.boxId,
        decorationIds: state.decorationIds,
        deliveryWanted: state.delivery.wanted,
        deliveryAddress: state.delivery.address,
        deliveryTime: state.delivery.time,
        deliveryReferences: state.delivery.references,
        customization: state.customization,
      };
      // El precio mostrado en esta pantalla NUNCA se envía al backend: el
      // backend lo recalcula desde cero con calculateOrderPricing().
      const res = await api.post('/orders', payload);
      reset();
      navigate(`/pedido/${res.data.order.orderNumber}`);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Nota: en producción, este resumen (incluyendo el precio) debería
  // solicitarse a un endpoint de "preview" en backend en vez de calcularse
  // aquí. Se muestra localmente solo para UX; el pedido real se valida
  // 100% en backend al confirmar.

  return (
    <div className="min-h-screen pb-28">
      <StepIndicator current={5} />
      <div className="p-4 space-y-4">
        <h2 className="font-display text-xl font-bold">Resumen de tu box</h2>

        <Section title="Productos">
          {state.products.map((p) => (
            <p key={p.productId} className="text-sm">
              {p.name} x{p.quantity}
            </p>
          ))}
        </Section>

        {state.companions.length > 0 && (
          <Section title="Acompañantes">
            {state.companions.map((c) => (
              <p key={c.productId} className="text-sm">
                {c.name} x{c.quantity}
              </p>
            ))}
          </Section>
        )}

        <Section title="Caja">
          <p className="text-sm">{state.boxName}</p>
        </Section>

        <Section title="Personalización">
          <p className="text-sm">Temática: {state.customization.theme}</p>
          <p className="text-sm">Colores: {state.customization.predominantColors}</p>
          {state.customization.hasDedication && (
            <p className="text-sm">Dedicatoria: {state.customization.dedicationText}</p>
          )}
        </Section>

        <Section title="Entrega">
          <p className="text-sm">De: {state.delivery.fromName} → Para: {state.delivery.toName}</p>
          <p className="text-sm">{state.delivery.wanted ? state.delivery.address : 'Punto de recojo gratuito'}</p>
          <p className="text-sm">Hora: {state.delivery.time}</p>
        </Section>

        <div className="bg-rose-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-500">El precio final se calculará al confirmar tu pedido.</p>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        <button className="btn-secondary" onClick={() => navigate('/armar-box/entrega')} disabled={submitting}>
          Atrás
        </button>
        <button className="btn-primary" onClick={confirm} disabled={submitting}>
          {submitting ? 'Creando pedido…' : 'CONFIRMAR PEDIDO'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{title}</p>
      {children}
    </div>
  );
}
