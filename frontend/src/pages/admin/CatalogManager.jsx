import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import api from '../../api/client';

/**
 * Componente CRUD genérico. Se reutiliza para Productos, Cajas, Decoración
 * y Acompañantes (secciones 28-31), que comparten la misma forma de datos.
 *
 * @param {string} endpoint - ej. "/products"
 * @param {string} title
 * @param {boolean} hasCategory
 */
export default function CatalogManager({ endpoint, title, hasCategory = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // item en edición, o {} para "nuevo"
  const [form, setForm] = useState({ name: '', description: '', cost: '', category: '', available: true });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get(`${endpoint}/admin`)
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  };
  useEffect(load, [endpoint]);

  const openNew = () => {
    setForm({ name: '', description: '', cost: '', category: '', available: true });
    setFile(null);
    setEditing({});
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description || '',
      cost: item.cost,
      category: item.category || '',
      available: item.available,
    });
    setFile(null);
    setEditing(item);
  };

  const save = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('cost', form.cost);
    fd.append('available', form.available);
    if (hasCategory) fd.append('category', form.category);
    if (file) fd.append('photo', file);

    try {
      if (editing?._id) {
        await api.put(`${endpoint}/${editing._id}`, fd);
      } else {
        await api.post(endpoint, fd);
      }
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item) => {
    await api.patch(`${endpoint}/${item._id}/toggle`);
    load();
  };

  const remove = async (item) => {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    await api.delete(`${endpoint}/${item._id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <button className="btn-primary w-auto px-4" onClick={openNew}>
          + Nuevo
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gray-50 flex items-center justify-center">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <ImageOff className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">Costo: S/ {item.cost.toFixed(2)}</p>
                <p className={`text-xs ${item.available ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.available ? 'Disponible' : 'Desactivado'}
                </p>
                <div className="flex gap-2 mt-2">
                  <button className="text-xs text-rose-600 font-semibold" onClick={() => openEdit(item)}>
                    Editar
                  </button>
                  <button className="text-xs text-gray-500" onClick={() => toggle(item)}>
                    {item.available ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="text-xs text-red-500 ml-auto" onClick={() => remove(item)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md space-y-3">
            <h2 className="font-semibold">{editing._id ? 'Editar' : 'Nuevo'} {title.slice(0, -1)}</h2>
            <input
              className="input-field"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              className="input-field"
              placeholder="Descripción"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              className="input-field"
              type="number"
              min="0"
              step="0.1"
              placeholder="Costo interno (S/)"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
            {hasCategory && (
              <input
                className="input-field"
                placeholder="Categoría"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            )}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-rose-600"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              Disponible
            </label>
            <div className="flex gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="btn-primary" disabled={saving || !form.name || form.cost === ''} onClick={save}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
