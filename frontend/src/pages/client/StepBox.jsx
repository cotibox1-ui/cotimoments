import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Check } from 'lucide-react';
import api from '../../api/client';
import StepIndicator from '../../components/StepIndicator';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepBox() {
  const navigate = useNavigate();
  const { state, updateBox } = useBoxBuilder();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/boxes')
      .then((res) => setBoxes(res.data.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <StepIndicator current={3} />
      <div className="p-4">
        <h2 className="font-display text-xl font-bold mb-1 text-ink-900">Elige tu caja</h2>
        <p className="text-sm text-ink-400 mb-4">El precio se calculará al final, no lo verás aquí.</p>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Cargando…</p>
        ) : (
          <div className="space-y-3">
            {boxes.map((box) => {
              const active = state.boxId === box._id;
              return (
                <button
                  key={box._id}
                  onClick={() => updateBox(box._id, box.name, box.photoUrl)}
                  className={`relative w-full text-left flex items-center gap-3 bg-white rounded-2xl p-2.5 border-2 transition-all duration-150
                    ${active ? 'border-rose-600 shadow-soft' : 'border-transparent shadow-card'}`}
                >
                  <div className="w-16 h-16 rounded-xl bg-rose-50 overflow-hidden shrink-0 flex items-center justify-center p-1.5">
                    {box.photoUrl ? (
                      <img src={box.photoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-white border border-dashed border-rose-200 flex items-center justify-center">
                        <Package className="w-5 h-5 text-rose-200" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight text-ink-900">{box.name}</p>
                    {box.description && <p className="text-xs text-ink-400 mt-0.5">{box.description}</p>}
                  </div>
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-soft">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-rose-50 p-4 flex gap-3">
        <button className="btn-secondary" onClick={() => navigate('/armar-box/acompanantes')}>
          Atrás
        </button>
        <button className="btn-primary" disabled={!state.boxId} onClick={() => navigate('/armar-box/personalizacion')}>
          Continuar
        </button>
      </div>
    </div>
  );
}
