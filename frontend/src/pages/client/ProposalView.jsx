import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';

export default function ProposalView() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [freeLocationName, setFreeLocationName] = useState('Parque Alameda');

  const [form, setForm] = useState({
    fromName: '',
    toName: '',
    contactPhone: '',
    deliveryWanted: false,
    deliveryAddress: '',
    deliveryTime: '',
    deliveryReferences: '',
  });

  useEffect(() => {
    api
      .get(`/proposals/${publicId}`)
      .then((res) => setProposal(res.data.proposal))
      .catch(() => setError('Esta propuesta no existe o ya no está disponible.'));
    api.get('/configuration/public').then((res) => setFreeLocationName(res.data.delivery.freeLocationName));
  }, [publicId]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const canConfirm =
    form.fromName.trim() &&
    form.toName.trim() &&
    form.contactPhone.trim() &&
    form.deliveryTime.trim() &&
    (!form.deliveryWanted || form.deliveryAddress.trim());

  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/proposals/${publicId}/confirm`, form);
      navigate(`/pedido/${res.data.order.orderNumber}`);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo confirmar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !proposal) return <p className="text-center text-red-600 py-20 px-6">{error}</p>;
  if (!proposal) return <p className="text-center text-gray-400 py-20">Cargando…</p>;

  return (
    <div className="min-h-screen pb-32 bg-rose-50">
      {proposal.referenceImageUrl && (
        <img src={proposal.referenceImageUrl} alt="Tu box" className="w-full h-56 object-cover" />
      )}

      <div className="p-4 space-y-4">
        <h1 className="font-display text-xl font-bold text-rose-600">Tu box personalizado</h1>

        <Section title="Productos">
          {proposal.products.map((p) => (
            <p key={p.name} className="text-sm">
              {p.name} x{p.quantity}
            </p>
          ))}
        </Section>

        {proposal.companions.length > 0 && (
          <Section title="Acompañantes">
            {proposal.companions.map((c) => (
              <p key={c.name} className="text-sm">
                {c.name} x{c.quantity}
              </p>
            ))}
          </Section>
        )}

        <Section title="Caja y decoración">
          <p className="text-sm">{proposal.box.name}</p>
          {proposal.decorations.map((d) => (
            <p key={d.name} className="text-sm">
              {d.name}
            </p>
          ))}
        </Section>

        {(proposal.customization?.theme || proposal.customization?.predominantColors) && (
          <Section title="Personalización">
            {proposal.customization.theme && <p className="text-sm">Temática: {proposal.customization.theme}</p>}
            {proposal.customization.predominantColors && (
              <p className="text-sm">Colores: {proposal.customization.predominantColors}</p>
            )}
          </Section>
        )}

        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-400">Precio del box</span>
          <span className="font-display text-2xl font-bold text-rose-600">
            S/ {proposal.pricing.boxPrice.toFixed(2)}
          </span>
        </div>

        <hr className="border-gray-100" />
        <h2 className="font-semibold">Datos de entrega</h2>

        <Field label="De" value={form.fromName} onChange={(v) => set({ fromName: v })} />
        <Field label="Para" value={form.toName} onChange={(v) => set({ toName: v })} />
        <Field label="Número de contacto" value={form.contactPhone} onChange={(v) => set({ contactPhone: v })} type="tel" />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-5 h-5 accent-rose-600"
            checked={form.deliveryWanted}
            onChange={(e) => set({ deliveryWanted: e.target.checked })}
          />
          <span className="text-sm font-semibold text-gray-700">Deseo delivery (S/ 10)</span>
        </label>

        {form.deliveryWanted ? (
          <Field label="Dirección de entrega" value={form.deliveryAddress} onChange={(v) => set({ deliveryAddress: v })} />
        ) : (
          <p className="text-sm bg-green-50 text-green-700 rounded-xl p-3">Entrega en {freeLocationName} — GRATIS</p>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-700">Hora de entrega</label>
          <input
            type="time"
            className="input-field mt-1"
            value={form.deliveryTime}
            onChange={(e) => set({ deliveryTime: e.target.value })}
          />
        </div>

        <Field label="Referencias adicionales" value={form.deliveryReferences} onChange={(v) => set({ deliveryReferences: v })} textarea />

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4">
        <button className="btn-primary" disabled={!canConfirm || submitting} onClick={confirm}>
          {submitting ? 'Confirmando…' : 'CONFIRMAR PEDIDO'}
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

function Field({ label, value, onChange, type = 'text', textarea = false }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {textarea ? (
        <textarea className="input-field mt-1" rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className="input-field mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
