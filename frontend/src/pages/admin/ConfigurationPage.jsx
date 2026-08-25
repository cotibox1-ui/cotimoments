import { useEffect, useState } from 'react';
import api from '../../api/client';

// Estructura por defecto: si algún campo todavía no existe en tu base de
// datos (por ejemplo, la config se creó antes de que se agregara un campo
// nuevo), se usa este valor en vez de "undefined" — así la pantalla nunca
// se rompe por un campo faltante.
const DEFAULTS = {
  business: { name: '', logoUrl: '', contactPhone: '', contactEmail: '' },
  whatsapp: { phoneNumber: '' },
  payment: { instructions: '', accountData: '' },
  pricing: { profitPercentage: 100 },
  delivery: { cost: 10, freeLocationName: 'Parque Alameda' },
  messages: { welcomeTitle: '', welcomeSubtitle: '', welcomeButton: '' },
};

export default function ConfigurationPage() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const normalize = (raw) => ({
    business: { ...DEFAULTS.business, ...raw.business },
    whatsapp: { ...DEFAULTS.whatsapp, ...raw.whatsapp },
    payment: { ...DEFAULTS.payment, ...raw.payment },
    pricing: { ...DEFAULTS.pricing, ...raw.pricing },
    delivery: { ...DEFAULTS.delivery, ...raw.delivery },
    messages: { ...DEFAULTS.messages, ...raw.messages },
  });

  const load = () => {
    setError('');
    api
      .get('/configuration')
      .then((res) => setConfig(normalize(res.data.config || {})))
      .catch((err) => setError(err.response?.data?.error || 'No se pudo cargar la configuración.'));
  };
  useEffect(load, []);

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-3">{error}</p>
        <button className="btn-secondary w-auto px-4" onClick={load}>
          Reintentar
        </button>
      </div>
    );
  }
  if (!config) return <p className="text-gray-400">Cargando…</p>;

  const set = (section, patch) =>
    setConfig((prev) => ({ ...prev, [section]: { ...DEFAULTS[section], ...prev[section], ...patch } }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.put('/configuration', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-bold mb-2">Configuración</h1>

      <Section title="Negocio">
        <Field label="Nombre" value={config.business.name} onChange={(v) => set('business', { name: v })} />
        <Field label="Logo (URL)" value={config.business.logoUrl} onChange={(v) => set('business', { logoUrl: v })} />
        <Field label="Teléfono de contacto" value={config.business.contactPhone} onChange={(v) => set('business', { contactPhone: v })} />
      </Section>

      <Section title="WhatsApp">
        <Field
          label="Número (ej. 51987654321)"
          value={config.whatsapp.phoneNumber}
          onChange={(v) => set('whatsapp', { phoneNumber: v })}
        />
      </Section>

      <Section title="Pago">
        <Field label="Instrucciones" value={config.payment.instructions} onChange={(v) => set('payment', { instructions: v })} textarea />
        <Field label="Datos de la cuenta" value={config.payment.accountData} onChange={(v) => set('payment', { accountData: v })} />
      </Section>

      <Section title="Precios">
        <Field
          label="Porcentaje de ganancia (%)"
          type="number"
          value={config.pricing.profitPercentage}
          onChange={(v) => set('pricing', { profitPercentage: Number(v) })}
        />
      </Section>

      <Section title="Delivery">
        <Field label="Costo (S/)" type="number" value={config.delivery.cost} onChange={(v) => set('delivery', { cost: Number(v) })} />
        <Field
          label="Punto de entrega gratuito"
          value={config.delivery.freeLocationName}
          onChange={(v) => set('delivery', { freeLocationName: v })}
        />
      </Section>

      <Section title="Mensajes al cliente">
        <Field label="Título de bienvenida" value={config.messages.welcomeTitle} onChange={(v) => set('messages', { welcomeTitle: v })} />
        <Field
          label="Subtítulo"
          value={config.messages.welcomeSubtitle}
          onChange={(v) => set('messages', { welcomeSubtitle: v })}
          textarea
        />
        <Field label="Texto del botón" value={config.messages.welcomeButton} onChange={(v) => set('messages', { welcomeButton: v })} />
      </Section>

      <button className="btn-primary" disabled={saving} onClick={save}>
        {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', textarea = false }) {
  const safeValue = value ?? '';
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {textarea ? (
        <textarea className="input-field mt-1" rows={2} value={safeValue} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className="input-field mt-1" value={safeValue} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
