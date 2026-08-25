import { useEffect, useState } from 'react';
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

  const loadProposals = () => api.get('/proposals').then((res) => setProposals(res.data.proposals));

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

  const createProposal = async () => {
    setError('');
    setCreating(true);
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

  const canCreate = selection.boxId && selection.products.length > 0;

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="font-display text-2xl font-bold">Crear oferta de box</h1>

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
        <div className="grid grid-cols-2 gap-2">
          {catalogs.boxes.map((box) => (
            <button
              key={box._id}
              onClick={() => setSelection((s) => ({ ...s, boxId: box._id }))}
              className={`text-left p-3 rounded-xl border-2 text-sm ${
                selection.boxId === box._id ? 'border-rose-600 bg-rose-50' : 'border-gray-100 bg-white'
              }`}
            >
              {box.name} <span className="text-gray-400">(S/ {box.cost.toFixed(2)})</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Decoración">
        <div className="flex flex-wrap gap-2">
          {catalogs.decorations.map((d) => (
            <button
              key={d._id}
              onClick={() => toggleDecoration(d._id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                selection.decorationIds.includes(d._id) ? 'bg-rose-600 text-white border-rose-600' : 'bg-white border-gray-200'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Personalización">
        <input
          className="input-field mb-2"
          placeholder="Temática"
          value={selection.customization.theme}
          onChange={(e) => setSelection((s) => ({ ...s, customization: { ...s.customization, theme: e.target.value } }))}
        />
        <input
          className="input-field"
          placeholder="Foto referencial (URL de Cloudinary)"
          value={selection.referenceImageUrl}
          onChange={(e) => setSelection((s) => ({ ...s, referenceImageUrl: e.target.value }))}
        />
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary" disabled={!canCreate || creating} onClick={createProposal}>
        {creating ? 'Calculando precio…' : 'CREAR PROPUESTA PARA CLIENTE'}
      </button>

      {preview && (
        <div className="bg-rose-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm">
            Precio del box: <b>S/ {preview.proposal.pricing.boxPrice.toFixed(2)}</b>
          </p>
          <div className="flex items-center gap-2">
            <input readOnly className="input-field text-xs" value={preview.publicUrl} />
            <button
              className="btn-secondary w-auto px-3 shrink-0"
              onClick={() => navigator.clipboard.writeText(preview.publicUrl)}
            >
              Copiar link
            </button>
          </div>
        </div>
      )}

      <Section title={`Propuestas existentes (${proposals.length})`}>
        <div className="space-y-2">
          {proposals.map((p) => (
            <div key={p._id} className="flex justify-between text-sm border-b border-gray-50 pb-2">
              <span>{p.publicId}</span>
              <span className="text-gray-400">{p.status}</span>
              <span>S/ {p.pricing.boxPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function PickerGrid({ items, selected, onDelta }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const qty = selected.find((s) => s.productId === item._id)?.quantity || 0;
        return (
          <div key={item._id} className="flex items-center justify-between bg-white rounded-xl p-2 border border-gray-100">
            <span className="text-sm">{item.name}</span>
            <div className="flex items-center gap-2">
              <button className="w-6 h-6 bg-gray-100 rounded-full" onClick={() => onDelta(item, -1)}>
                −
              </button>
              <span className="text-sm font-semibold">{qty}</span>
              <button className="w-6 h-6 bg-rose-600 text-white rounded-full" onClick={() => onDelta(item, 1)}>
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{title}</p>
      {children}
    </div>
  );
}
