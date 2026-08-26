import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
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
      <StepIndicator current={2} />
      <div className="p-4">
        <h2 className="font-display text-xl font-bold mb-1">Elige tu caja</h2>
        <p className="text-sm text-gray-400 mb-4">El precio se calculará al final, no lo verás aquí.</p>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Cargando…</p>
        ) : (
          <div className="space-y-3">
            {boxes.map((box) => (
              <button
                key={box._id}
                onClick={() => updateBox(box._id, box.name, box.photoUrl)}
                className={`w-full text-left flex items-center gap-3 bg-white rounded-2xl p-3 border transition
                  ${state.boxId === box._id ? 'border-rose-600' : 'border-gray-100'}`}
              >
                <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {box.photoUrl ? (
                    <img src={box.photoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{box.name}</p>
                  {box.description && <p className="text-xs text-gray-400">{box.description}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex gap-3">
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
