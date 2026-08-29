import { ImageOff, Check } from 'lucide-react';

// Muestra un catálogo (productos o acompañantes) SIN precios — regla
// obligatoria de la sección 6/7: el cliente nunca ve precios individuales.
export default function ItemPicker({ items, selected, onChange }) {
  const getQty = (id) => selected.find((s) => s.productId === id)?.quantity || 0;

  const setQty = (item, qty) => {
    const rest = selected.filter((s) => s.productId !== item._id);
    if (qty > 0) {
      onChange([...rest, { productId: item._id, name: item.name, quantity: qty, photoUrl: item.photoUrl || '' }]);
    } else {
      onChange(rest);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
      {items.map((item) => {
        const qty = getQty(item._id);
        const active = qty > 0;
        return (
          <div
            key={item._id}
            className={`bg-white rounded-2xl overflow-hidden border-2 transition-all duration-150 ${
              active ? 'border-rose-600 shadow-soft' : 'border-transparent shadow-card'
            }`}
          >
            <div className="relative aspect-square bg-rose-50 flex items-center justify-center p-2.5">
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-white border border-dashed border-rose-200 flex items-center justify-center">
                  <ImageOff className="w-5 h-5 text-rose-200" strokeWidth={1.5} />
                </div>
              )}
              {active && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-soft">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm leading-tight text-ink-900">{item.name}</p>
              {item.description && (
                <p className="text-xs text-ink-400 leading-snug mt-0.5 line-clamp-2">{item.description}</p>
              )}
              <div className="mt-2.5 flex items-center justify-between">
                <button
                  className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 font-semibold text-sm active:scale-95 transition"
                  onClick={() => setQty(item, Math.max(0, qty - 1))}
                >
                  −
                </button>
                <span className="font-semibold text-sm tabular-nums text-ink-900">{qty}</span>
                <button
                  className="w-7 h-7 rounded-full bg-rose-600 text-white font-semibold text-sm active:scale-95 transition shadow-soft"
                  onClick={() => setQty(item, qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
