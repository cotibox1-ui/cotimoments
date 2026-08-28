import { useEffect, useState } from 'react';
import { Store, MessageCircle, Wallet, Percent, Truck, MessageSquareText, Check } from 'lucide-react';
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
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
  if (!config) return <p className="text-ink-400">Cargando…</p>;

  const set = (section, patch) =>
    setConfig((prev) => ({ ...prev, [section]: { ...DEFAULTS[section], ...prev[section], ...patch } }));

  const uploadLogo = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/uploads', fd);
      set('business', { logoUrl: res.data.url });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir el logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

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
    <div className="max-w-xl space-y-4 pb-24">
      <h1 className="font-display text-2xl font-bold text-ink-900">Configuración</h1>

      <Section title="Negocio" icon={Store}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-14 h-14 rounded-full bg-rose-50 overflow-hidden flex items-center justify-center shrink-0">
            {config.business.logoUrl ? (
              <img src={config.business.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-rose-200" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-ink-900 block mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={(e) => uploadLogo(e.target.files[0])} disabled={uploadingLogo} className="text-xs" />
            {uploadingLogo && <p className="text-xs text-ink-400 mt-0.5">Subiendo…</p>}
          </div>
        </div>
        <Field label="Nombre" value={config.business.name} onChange={(v) => set('business', { name: v })} />
        <Field label="Teléfono de contacto" value={config.business.contactPhone} onChange={(v) => set('business', { contactPhone: v })} />
      </Section>

      <Section title="WhatsApp" icon={MessageCircle}>
        <Field
          label="Número (ej. 51987654321)"
          value={config.whatsapp.phoneNumber}
          onChange={(v) => set('whatsapp', { phoneNumber: v })}
        />
      </Section>

      <Section title="Pago" icon={Wallet}>
        <Field label="Instrucciones" value={config.payment.instructions} onChange={(v) => set('payment', { instructions: v })} textarea />
        <Field label="Datos de la cuenta" value={config.payment.accountData} onChange={(v) => set('payment', { accountData: v })} />
      </Section>

      <Section title="Precios" icon={Percent}>
        <Field
          label="Porcentaje de ganancia (%)"
          type="number"
          value={config.pricing.profitPercentage}
          onChange={(v) => set('pricing', { profitPercentage: Number(v) })}
        />
      </Section>

      <Section title="Delivery" icon={Truck}>
        <Field label="Costo (S/)" type="number" value={config.delivery.cost} onChange={(v) => set('delivery', { cost: Number(v) })} />
        <Field
          label="Punto de entrega gratuito"
          value={config.delivery.freeLocationName}
          onChange={(v) => set('delivery', { freeLocationName: v })}
        />
      </Section>

      <Section title="Mensajes al cliente" icon={MessageSquareText}>
        <Field label="Título de bienvenida" value={config.messages.welcomeTitle} onChange={(v) => set('messages', { welcomeTitle: v })} />
        <Field
          label="Subtítulo"
          value={config.messages.welcomeSubtitle}
          onChange={(v) => set('messages', { welcomeSubtitle: v })}
          textarea
        />
        <Field label="Texto del botón" value={config.messages.welcomeButton} onChange={(v) => set('messages', { welcomeButton: v })} />
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary flex items-center justify-center gap-2" disabled={saving} onClick={save}>
        {saved && <Check className="w-4 h-4" strokeWidth={2.5} />}
        {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
      </button>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-4 space-y-3">
      <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', textarea = false }) {
  const safeValue = value ?? '';
  return (
    <div>
      <label className="text-sm font-semibold text-ink-900">{label}</label>
      {textarea ? (
        <textarea className="input-field mt-1" rows={2} value={safeValue} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className="input-field mt-1" value={safeValue} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
