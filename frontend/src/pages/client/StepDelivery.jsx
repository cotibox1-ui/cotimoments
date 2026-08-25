import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StepIndicator from '../../components/StepIndicator';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepDelivery() {
  const navigate = useNavigate();
  const { state, updateDelivery } = useBoxBuilder();
  const d = state.delivery;
  const [freeLocationName, setFreeLocationName] = useState('Parque Alameda');

  useEffect(() => {
    api.get('/configuration/public').then((res) => setFreeLocationName(res.data.delivery.freeLocationName));
  }, []);

  const canContinue =
    d.fromName.trim() &&
    d.toName.trim() &&
    d.contactPhone.trim() &&
    d.time.trim() &&
    (!d.wanted || d.address.trim());

  return (
    <div className="min-h-screen pb-28">
      <StepIndicator current={4} />
      <div className="p-4 space-y-5">
        <h2 className="font-display text-xl font-bold">Datos de entrega</h2>

        <div>
          <label className="text-sm font-semibold text-gray-700">De</label>
          <input className="input-field mt-1" value={d.fromName} onChange={(e) => updateDelivery({ fromName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Para</label>
          <input className="input-field mt-1" value={d.toName} onChange={(e) => updateDelivery({ toName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Número de contacto</label>
          <input
            className="input-field mt-1"
            type="tel"
            value={d.contactPhone}
            onChange={(e) => updateDelivery({ contactPhone: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={d.wanted}
            onChange={(e) => updateDelivery({ wanted: e.target.checked })}
            className="w-5 h-5 accent-rose-600"
          />
          <span className="text-sm font-semibold text-gray-700">Deseo delivery (S/ 10)</span>
        </label>

        {d.wanted ? (
          <div>
            <label className="text-sm font-semibold text-gray-700">Dirección de entrega</label>
            <input className="input-field mt-1" value={d.address} onChange={(e) => updateDelivery({ address: e.target.value })} />
          </div>
        ) : (
          <p className="text-sm bg-green-50 text-green-700 rounded-xl p-3">
            Entrega en {freeLocationName} — GRATIS
          </p>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-700">Hora de entrega</label>
          <input
            className="input-field mt-1"
            type="time"
            value={d.time}
            onChange={(e) => updateDelivery({ time: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Referencias adicionales</label>
          <textarea
            className="input-field mt-1"
            rows={2}
            value={d.references}
            onChange={(e) => updateDelivery({ references: e.target.value })}
          />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        <button className="btn-secondary" onClick={() => navigate('/armar-box/personalizacion')}>
          Atrás
        </button>
        <button className="btn-primary" disabled={!canContinue} onClick={() => navigate('/armar-box/confirmacion')}>
          Ver precio final
        </button>
      </div>
    </div>
  );
}
