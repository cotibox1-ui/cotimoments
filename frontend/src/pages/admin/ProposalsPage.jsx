import { useEffect, useState } from 'react';
import { ImageOff, Package, Check, Copy, Link2, Trash2, Share2 } from 'lucide-react';
import api from '../../api/client';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [catalogs, setCatalogs] = useState({ products: [], companions: [], boxes: [], decorations: [] });
  const [creating, setCreating] = useState(false);

  const [selection, setSelection] = useState({
    products: [], // { productId, name, quantity }
    companions: [],
    boxId: '',
    decorationIds: [],
    customization: { theme: '', predominantColors: '', hasDedication: false, dedicationText: '', cardStyleDescription: '' },
    referenceImageUrl: '',
  });
  const [preview, setPreview] = useState(null); // { proposal, publicUrl }
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadProposals = () => api.get('/proposals').then((res) => setProposals(res.data.proposals));

  const deleteProposal = async (proposal) => {
    if (!confirm(`¿Eliminar la propuesta ${proposal.publicId}? Esto no afecta pedidos ya creados a partir de ella.`)) return;
    await api.delete(`/proposals/${proposal._id}`);
    loadProposals();
  };

  useEffect(() => {
    loadProposals();
    Promise.all([
      api.get('/products/admin'),
      api.get('/companions/admin'),
      api.get('/boxes/admin'),
      api.get('/decorations/admin'),
    ]).then(([products, companions, boxes, decorations]) => {
      setCatalogs({
        products: products.data.items,
        companions: companions.data.items,
        boxes: boxes.data.items,
        decorations: decorations.data.items,
      });
    });
  }, []);

  const toggleQty = (list, item, delta) => {
    const existing = list.find((s) => s.productId === item._id);
    const currentQty = existing?.quantity || 0;
    const newQty = Math.max(0, currentQty + delta);
    const rest = list.filter((s) => s.productId !== item._id);
    return newQty > 0 ? [...rest, { productId: item._id, name: item.name, quantity: newQty }] : rest;
  };

  const toggleDecoration = (id) => {
    setSelection((s) => ({
      ...s,
      decorationIds: s.decorationIds.includes(id) ? s.decorationIds.filter((d) => d !== id) : [...s.decorationIds, id],
    }));
  };

  const uploadReferencePhoto = async (file) => {
    if (!file) return;
    setError('');
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/uploads', fd);
      setSelection((s) => ({ ...s, referenceImageUrl: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir la foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const createProposal = async () => {
    setError('');
    setCreating(true);
    setCopied(false);
    try {
      const res = await api.post('/proposals', selection);
      setPreview(res.data);
      loadProposals();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la propuesta.');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(preview.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Tu box personalizado', url: preview.publicUrl });
      } catch (err) {
        // El usuario cerró el selector de compartir sin elegir nada — no es un error real.
      }
    } else {
      copyLink();
    }
  };

  const selectedBox = catalogs.boxes.find((b) => b._id === selection.boxId);
  const canCreate = selection.boxId && selection.products.length > 0;
  const totalItems = selection.products.reduce((s, p) => s + p.quantity, 0) + selection.companions.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="pb-24 lg:pb-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Crear oferta de box</h1>
      <p className="text-sm text-ink-400 mt-1 mb-4">Arma el box como si fueras el cliente, y genera un link para compartirlo.</p>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        {/* ---- Columna izquierda: catálogo ---- */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Productos">
            <PickerGrid
              items={catalogs.products}
              selected={selection.products}
              onDelta={(item, d) => setSelection((s) => ({ ...s, products: toggleQty(s.products, item, d) }))}
            />
          </Section>

          <Section title="Acompañantes">
            <PickerGrid
              items={catalogs.companions}
              selected={selection.companions}
              onDelta={(item, d) => setSelection((s) => ({ ...s, companions: toggleQty(s.companions, item, d) }))}
            />
          </Section>

          <Section title="Caja">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {catalogs.boxes.map((b) => {
                const active = selection.boxId === b._id;
                return (
                  <button
                    key={b._id}
                    onClick={() => setSelection((s) => ({ ...s, boxId: b._id }))}
                    className={`relative flex items-center gap-2.5 text-left p-2.5 rounded-2xl border-2 transition-all ${
                      active ? 'border-rose-600 shadow-soft' : 'border-transparent shadow-card'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-lg bg-rose-50 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      {b.photoUrl ? (
                        <img src={b.photoUrl} alt="" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Package className="w-4 h-4 text-rose-200" strokeWidth={1.5} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-ink-900 leading-tight">{b.name}</span>
                    {active && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Decoración">
            <div className="flex flex-wrap gap-2">
              {catalogs.decorations.map((d) => (
                <button
                  key={d._id}
                  onClick={() => toggleDecoration(d._id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selection.decorationIds.includes(d._id)
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white border-gray-200 text-ink-600'
                  }`}
                >
                  {d.name}
                </button>
              ))}
              {catalogs.decorations.length === 0 && <p className="text-sm text-ink-400">No hay elementos de decoración cargados.</p>}
            </div>
          </Section>

          <Section title="Personalización">
            <input
              className="input-field mb-3"
              placeholder="Temática (ej. Cumpleaños de mi enamorada)"
              value={selection.customization.theme}
              onChange={(e) => setSelection((s) => ({ ...s, customization: { ...s.customization, theme: e.target.value } }))}
            />

            <label className="text-sm font-semibold text-ink-900 block mb-1.5">Foto referencial del box</label>
            {selection.referenceImageUrl && (
              <div className="w-24 h-24 rounded-xl bg-rose-50 overflow-hidden mb-2 p-1.5">
                <img src={selection.referenceImageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadReferencePhoto(e.target.files[0])}
              disabled={uploadingPhoto}
              className="text-sm"
            />
            {uploadingPhoto && <p className="text-xs text-ink-400 mt-1">Subiendo foto…</p>}
          </Section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Section title={`Propuestas existentes (${proposals.length})`}>
            <div className="space-y-2">
              {proposals.length === 0 && <p className="text-sm text-ink-400">Aún no has creado ninguna propuesta.</p>}
              {proposals.map((p) => (
                <div key={p._id} className="flex justify-between items-center gap-2 text-sm border-b border-rose-50 last:border-0 pb-2">
                  <span className="font-medium text-ink-900">{p.publicId}</span>
                  <ProposalStatusBadge status={p.status} />
                  <span className="font-semibold text-rose-600">S/ {p.pricing.boxPrice.toFixed(2)}</span>
                  <button
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0"
                    onClick={() => deleteProposal(p)}
                    title="Eliminar propuesta"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ---- Columna derecha: resumen del box, fijo al hacer scroll en desktop (sección 11) ---- */}
        <div className="mt-4 lg:mt-0 lg:sticky lg:top-[88px]">
          <div className="card overflow-hidden">
            {selection.referenceImageUrl && (
              <div className="h-32 bg-rose-50">
                <img src={selection.referenceImageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1">Resumen del box</p>
              <p className="text-sm text-ink-600">
                {totalItems} producto{totalItems !== 1 ? 's' : ''} · {selectedBox ? selectedBox.name : 'sin caja seleccionada'}
              </p>

              <button className="btn-primary mt-4" disabled={!canCreate || creating || uploadingPhoto} onClick={createProposal}>
                {uploadingPhoto ? 'Subiendo foto…' : creating ? 'Calculando precio…' : 'CREAR PROPUESTA'}
              </button>

              {preview && (
                <div className="mt-4 bg-rose-25 rounded-2xl p-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink-400">Precio del box</span>
                    <span className="font-display text-2xl font-bold text-rose-600">S/ {preview.proposal.pricing.boxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-rose-100 min-w-0">
                    <Link2 className="w-4 h-4 text-rose-400 shrink-0" strokeWidth={1.75} />
                    <span className="text-xs text-ink-600 truncate min-w-0">{preview.publicUrl}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1 flex items-center justify-center gap-1.5" onClick={copyLink}>
                      <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                      {copied ? '¡Copiado!' : 'Copiar link'}
                    </button>
                    <button className="btn-primary flex-1 flex items-center justify-center gap-1.5" onClick={shareLink}>
                      <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
                      Compartir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PROPOSAL_BADGE_STYLE = {
  ACTIVA: 'bg-emerald-50 text-emerald-600',
  CONVERTIDA: 'bg-indigo-50 text-indigo-600',
  EXPIRADA: 'bg-gray-100 text-gray-500',
};

function ProposalStatusBadge({ status }) {
  return <span className={`badge ${PROPOSAL_BADGE_STYLE[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

function PickerGrid({ items, selected, onDelta }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item) => {
        const qty = selected.find((s) => s.productId === item._id)?.quantity || 0;
        const active = qty > 0;
        return (
          <div
            key={item._id}
            className={`rounded-2xl overflow-hidden border-2 transition-all ${
              active ? 'border-rose-600 shadow-soft' : 'border-transparent shadow-card bg-white'
            }`}
          >
            <div className="aspect-square bg-rose-50 flex items-center justify-center p-2">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full rounded-lg bg-white border border-dashed border-rose-200 flex items-center justify-center">
                  <ImageOff className="w-4 h-4 text-rose-200" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="p-2 bg-white">
              <p className="text-xs font-semibold text-ink-900 truncate mb-1.5">{item.name}</p>
              <div className="flex items-center justify-between">
                <button className="w-6 h-6 bg-gray-100 rounded-full text-ink-600 text-xs font-semibold shrink-0" onClick={() => onDelta(item, -1)}>
                  −
                </button>
                <span className="text-sm font-semibold tabular-nums">{qty}</span>
                <button className="w-6 h-6 bg-rose-600 text-white rounded-full text-xs font-semibold shrink-0" onClick={() => onDelta(item, 1)}>
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-sm text-ink-400 col-span-2">No hay elementos cargados en este catálogo.</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-2.5">{title}</p>
      {children}
    </div>
  );
}
