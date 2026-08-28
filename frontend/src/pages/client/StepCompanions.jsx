import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StepIndicator from '../../components/StepIndicator';
import ItemPicker from '../../components/ItemPicker';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepCompanions() {
  const navigate = useNavigate();
  const { state, updateCompanions } = useBoxBuilder();
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/companions')
      .then((res) => setCompanions(res.data.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <StepIndicator current={2} />
      <div className="p-4">
        <h2 className="font-display text-xl font-bold mb-1">Acompañantes y regalos</h2>
        <p className="text-sm text-gray-400 mb-4">Este paso es opcional — puedes continuar sin elegir nada.</p>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Cargando…</p>
        ) : companions.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Por ahora no hay acompañantes disponibles.</p>
        ) : (
          <ItemPicker items={companions} selected={state.companions} onChange={updateCompanions} />
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        <button className="btn-secondary" onClick={() => navigate('/armar-box/productos')}>
          Atrás
        </button>
        <button className="btn-primary" onClick={() => navigate('/armar-box/caja')}>
          Continuar
        </button>
      </div>
    </div>
  );
}
