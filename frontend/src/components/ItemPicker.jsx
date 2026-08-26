import { ImageOff } from 'lucide-react';

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
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => {
        const qty = getQty(item._id);
        return (
          <div key={item._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-28 bg-gray-50 flex items-center justify-center">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <ImageOff className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm">{item.name}</p>
              {item.description && <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>}
              <div className="mt-2 flex items-center justify-between">
                <button
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold"
                  onClick={() => setQty(item, Math.max(0, qty - 1))}
                >
                  −
                </button>
                <span className="font-semibold">{qty}</span>
                <button
                  className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold"
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
