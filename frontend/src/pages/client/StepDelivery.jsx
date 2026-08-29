import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import api from '../../api/client';
import StepIndicator from '../../components/StepIndicator';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepDelivery() {
  const navigate = useNavigate();
  const { state, updateDelivery } = useBoxBuilder();
  const d = state.delivery;
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);

  useEffect(() => {
    api
      .get('/configuration/public')
      .then((res) => setZones(res.data.delivery.zones || []))
      .finally(() => setLoadingZones(false));
  }, []);

  const selectZone = (zone) => updateDelivery({ zoneName: zone.name, zoneCost: zone.cost });
  const isDelivery = d.zoneCost > 0;

  const canContinue =
    d.fromName.trim() &&
    d.fromPhone.trim() &&
    d.toName.trim() &&
    d.toPhone.trim() &&
    d.zoneName &&
    d.time.trim() &&
    (!isDelivery || d.address.trim());

  return (
    <div className="min-h-screen pb-28 lg:pb-8">
      <StepIndicator current={5} />
      <div className="p-4 lg:p-8 space-y-5 max-w-2xl mx-auto">
        <h2 className="font-display text-xl lg:text-2xl font-bold">Datos de entrega</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">De (quien envía)</label>
            <input className="input-field mt-1" value={d.fromName} onChange={(e) => updateDelivery({ fromName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Número de quien envía</label>
            <input
              className="input-field mt-1"
              type="tel"
              value={d.fromPhone}
              onChange={(e) => updateDelivery({ fromPhone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Para (quien recibe)</label>
            <input className="input-field mt-1" value={d.toName} onChange={(e) => updateDelivery({ toName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Número de quien recibe</label>
            <input
              className="input-field mt-1"
              type="tel"
              value={d.toPhone}
              onChange={(e) => updateDelivery({ toPhone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Zona de entrega</label>
          {loadingZones ? (
            <p className="text-sm text-gray-400">Cargando zonas…</p>
          ) : (
            <div className="space-y-2">
              {zones.map((zone) => {
                const active = d.zoneName === zone.name;
                return (
                  <button
                    key={zone.name}
                    onClick={() => selectZone(zone)}
                    className={`relative w-full flex items-center justify-between text-left px-4 py-3 rounded-2xl border-2 transition-all ${
                      active ? 'border-rose-600 shadow-soft' : 'border-gray-100'
                    }`}
                  >
                    <span className="text-sm font-medium text-ink-900">{zone.name}</span>
                    <span className={`text-sm font-semibold ${zone.cost === 0 ? 'text-emerald-600' : 'text-ink-600'}`}>
                      {zone.cost === 0 ? 'GRATIS' : `S/ ${zone.cost.toFixed(2)}`}
                    </span>
                    {active && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
              {zones.length === 0 && <p className="text-sm text-gray-400">No hay zonas de entrega configuradas todavía.</p>}
            </div>
          )}
        </div>

        {isDelivery && (
          <div>
            <label className="text-sm font-semibold text-gray-700">Dirección de entrega</label>
            <input className="input-field mt-1" value={d.address} onChange={(e) => updateDelivery({ address: e.target.value })} />
          </div>
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

        <div className="hidden lg:flex justify-end gap-3 pt-2">
          <button className="btn-secondary lg:w-auto lg:px-6" onClick={() => navigate('/armar-box/personalizacion')}>
            Atrás
          </button>
          <button className="btn-primary lg:w-auto lg:px-8" disabled={!canContinue} onClick={() => navigate('/armar-box/confirmacion')}>
            Ver precio final
          </button>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex gap-3">
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
