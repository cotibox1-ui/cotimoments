import { useEffect, useState } from 'react';
import { ImageOff, Plus, Pencil, Power, Trash2, Package } from 'lucide-react';
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
  const [filePreview, setFilePreview] = useState(null);
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
    setFilePreview(null);
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
    setFilePreview(item.photoUrl || null);
    setEditing(item);
  };

  const pickFile = (f) => {
    setFile(f);
    setFilePreview(f ? URL.createObjectURL(f) : null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="font-display text-2xl font-bold text-ink-900">{title}</h1>
        <button className="btn-primary sm:w-auto sm:px-4 flex items-center justify-center gap-1.5" onClick={openNew}>
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Agregar
        </button>
      </div>

      {loading ? (
        <p className="text-ink-400">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="card p-10 flex flex-col items-center text-center">
          <Package className="w-8 h-8 text-rose-200 mb-2" strokeWidth={1.5} />
          <p className="text-sm text-ink-400">Aún no has agregado nada aquí.</p>
          <button className="btn-secondary w-auto px-4 mt-3" onClick={openNew}>
            Agregar el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item._id} className="card overflow-hidden">
              <div className="relative aspect-square bg-rose-50 flex items-center justify-center p-3">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-white border border-dashed border-rose-200 flex items-center justify-center">
                    <ImageOff className="w-6 h-6 text-rose-200" strokeWidth={1.5} />
                  </div>
                )}
                <span className={`badge absolute top-1.5 right-1.5 !text-[9px] !px-1.5 !py-0.5 ${item.available ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {item.available ? 'Disponible' : 'Desactivado'}
                </span>
              </div>
              <div className="p-2.5">
                <p className="font-semibold text-sm text-ink-900 truncate">{item.name}</p>
                <p className="text-xs text-ink-400">S/ {item.cost.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl py-1.5 min-w-0"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="w-3 h-3 shrink-0" strokeWidth={2} />
                    <span className="truncate">Editar</span>
                  </button>
                  <button
                    className="flex items-center justify-center w-7 h-7 text-ink-500 bg-gray-50 rounded-xl shrink-0"
                    onClick={() => toggle(item)}
                    title={item.available ? 'Desactivar' : 'Activar'}
                  >
                    <Power className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                  <button
                    className="flex items-center justify-center w-7 h-7 text-red-500 bg-red-50 rounded-xl shrink-0"
                    onClick={() => remove(item)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20 p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-bold text-lg text-ink-900">
              {editing._id ? 'Editar' : 'Nuevo'} {title.slice(0, -1)}
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-rose-50 overflow-hidden shrink-0 flex items-center justify-center">
                {filePreview ? (
                  <img src={filePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageOff className="w-5 h-5 text-rose-200" strokeWidth={1.5} />
                )}
              </div>
              <input type="file" accept="image/*" onChange={(e) => pickFile(e.target.files[0])} className="text-sm flex-1" />
            </div>

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
            <label className="flex items-center gap-2 text-sm text-ink-600">
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
