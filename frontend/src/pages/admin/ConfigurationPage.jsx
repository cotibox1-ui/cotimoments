import { useEffect, useState } from 'react';
import { Store, MessageCircle, Wallet, Percent, Truck, MessageSquareText, Check, Plus, Trash2 } from 'lucide-react';
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
  delivery: { zones: [] },
  messages: { welcomeTitle: '', welcomeSubtitle: '', welcomeButton: '' },
};

const TABS = [
  { key: 'general', label: 'General', icon: Store },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'pagos', label: 'Pagos', icon: Wallet },
  { key: 'precios', label: 'Precios', icon: Percent },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'mensajes', label: 'Mensajes', icon: MessageSquareText },
];

export default function ConfigurationPage() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [tab, setTab] = useState('general');

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

  if (error && !config) {
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
    <div className="pb-24 lg:pb-6">
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-4">Configuración</h1>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6 lg:items-start">
        {/* ---- Tabs: horizontal scroll en móvil, sidebar vertical en desktop ---- */}
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 mb-4 lg:mb-0 card lg:sticky lg:top-[88px] p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                tab === t.key ? 'bg-rose-50 text-rose-600' : 'text-ink-600 hover:bg-rose-25'
              }`}
            >
              <t.icon className="w-4 h-4" strokeWidth={1.75} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ---- Contenido de la pestaña activa ---- */}
        <div className="space-y-4">
          {tab === 'general' && (
            <Panel title="Negocio">
              <div className="flex items-center gap-3 mb-1 md:col-span-2">
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
            </Panel>
          )}

          {tab === 'whatsapp' && (
            <Panel title="WhatsApp">
              <Field
                label="Número (ej. 51987654321)"
                value={config.whatsapp.phoneNumber}
                onChange={(v) => set('whatsapp', { phoneNumber: v })}
              />
            </Panel>
          )}

          {tab === 'pagos' && (
            <Panel title="Pago">
              <Field
                label="Instrucciones"
                value={config.payment.instructions}
                onChange={(v) => set('payment', { instructions: v })}
                textarea
                full
              />
              <Field label="Datos de la cuenta" value={config.payment.accountData} onChange={(v) => set('payment', { accountData: v })} />
            </Panel>
          )}

          {tab === 'precios' && (
            <Panel title="Precios">
              <Field
                label="Porcentaje de ganancia (%)"
                type="number"
                value={config.pricing.profitPercentage}
                onChange={(v) => set('pricing', { profitPercentage: Number(v) })}
              />
            </Panel>
          )}

          {tab === 'delivery' && (
            <Panel title="Zonas de entrega">
              <div className="md:col-span-2 space-y-2">
                <p className="text-xs text-ink-400 -mt-1 mb-2">
                  Cada zona tiene su propio costo. Una zona en S/ 0.00 se muestra al cliente como "GRATIS" (recojo).
                </p>
                {config.delivery.zones.map((zone, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="input-field flex-1"
                      placeholder="Nombre de la zona (ej. Cercado)"
                      value={zone.name}
                      onChange={(e) => {
                        const zones = [...config.delivery.zones];
                        zones[i] = { ...zones[i], name: e.target.value };
                        set('delivery', { zones });
                      }}
                    />
                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">S/</span>
                      <input
                        className="input-field pl-8"
                        type="number"
                        min="0"
                        step="0.5"
                        value={zone.cost}
                        onChange={(e) => {
                          const zones = [...config.delivery.zones];
                          zones[i] = { ...zones[i], cost: Number(e.target.value) };
                          set('delivery', { zones });
                        }}
                      />
                    </div>
                    <button
                      className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0"
                      onClick={() => set('delivery', { zones: config.delivery.zones.filter((_, idx) => idx !== i) })}
                      title="Eliminar zona"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {config.delivery.zones.length === 0 && <p className="text-sm text-ink-400">No hay zonas configuradas todavía.</p>}
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl px-4 py-2.5 mt-1"
                  onClick={() => set('delivery', { zones: [...config.delivery.zones, { name: '', cost: 0 }] })}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Agregar zona
                </button>
              </div>
            </Panel>
          )}

          {tab === 'mensajes' && (
            <Panel title="Mensajes al cliente">
              <Field label="Título de bienvenida" value={config.messages.welcomeTitle} onChange={(v) => set('messages', { welcomeTitle: v })} />
              <Field label="Texto del botón" value={config.messages.welcomeButton} onChange={(v) => set('messages', { welcomeButton: v })} />
              <Field
                label="Subtítulo"
                value={config.messages.welcomeSubtitle}
                onChange={(v) => set('messages', { welcomeSubtitle: v })}
                textarea
                full
              />
            </Panel>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn-primary lg:w-auto lg:px-6 flex items-center justify-center gap-2" disabled={saving} onClick={save}>
            {saved && <Check className="w-4 h-4" strokeWidth={2.5} />}
            {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="card p-4 md:p-5">
      <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-3">{title}</p>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', textarea = false, full = false }) {
  const safeValue = value ?? '';
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="text-sm font-semibold text-ink-900">{label}</label>
      {textarea ? (
        <textarea className="input-field mt-1" rows={2} value={safeValue} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className="input-field mt-1" value={safeValue} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
