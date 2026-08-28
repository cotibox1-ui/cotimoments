import { useNavigate } from 'react-router-dom';
import StepIndicator from '../../components/StepIndicator';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepCustomization() {
  const navigate = useNavigate();
  const { state, updateCustomization } = useBoxBuilder();
  const c = state.customization;

  const canContinue = c.theme.trim() && c.predominantColors.trim();

  return (
    <div className="min-h-screen pb-28">
      <StepIndicator current={4} />
      <div className="p-4 space-y-5">
        <h2 className="font-display text-xl font-bold">Personaliza tu box</h2>

        <div>
          <label className="text-sm font-semibold text-gray-700">¿Qué temática deseas para tu box?</label>
          <input
            className="input-field mt-1"
            placeholder="Ej. Cumpleaños de mi enamorada"
            value={c.theme}
            onChange={(e) => updateCustomization({ theme: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Colores predominantes</label>
          <input
            className="input-field mt-1"
            placeholder="Ej. Rosado, blanco y dorado"
            value={c.predominantColors}
            onChange={(e) => updateCustomization({ predominantColors: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={c.hasDedication}
            onChange={(e) => updateCustomization({ hasDedication: e.target.checked })}
            className="w-5 h-5 accent-rose-600"
          />
          <span className="text-sm font-semibold text-gray-700">Agregar dedicatoria</span>
        </label>

        {c.hasDedication && (
          <textarea
            className="input-field"
            rows={3}
            placeholder="Escribe tu dedicatoria…"
            value={c.dedicationText}
            onChange={(e) => updateCustomization({ dedicationText: e.target.value })}
          />
        )}

        <div>
          <label className="text-sm font-semibold text-gray-700">¿Cómo quieres que sea tu tarjeta?</label>
          <textarea
            className="input-field mt-1"
            rows={3}
            placeholder="Ej. Quiero que tenga corazones y rosas, con un estilo romántico y elegante."
            value={c.cardStyleDescription}
            onChange={(e) => updateCustomization({ cardStyleDescription: e.target.value })}
          />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        <button className="btn-secondary" onClick={() => navigate('/armar-box/caja')}>
          Atrás
        </button>
        <button className="btn-primary" disabled={!canContinue} onClick={() => navigate('/armar-box/entrega')}>
          Continuar
        </button>
      </div>
    </div>
  );
}
