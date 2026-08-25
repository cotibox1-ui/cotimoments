import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StepIndicator from '../../components/StepIndicator';
import ItemPicker from '../../components/ItemPicker';
import { useBoxBuilder } from '../../context/BoxBuilderContext';

export default function StepProducts() {
  const navigate = useNavigate();
  const { state, updateProducts } = useBoxBuilder();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.items))
      .finally(() => setLoading(false));
  }, []);

  const totalSelected = state.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="min-h-screen pb-28">
      <StepIndicator current={1} />
      <div className="p-4">
        <h2 className="font-display text-xl font-bold mb-1">Elige tus productos</h2>
        <p className="text-sm text-gray-400 mb-4">Selecciona todo lo que quieras incluir en tu box.</p>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Cargando productos…</p>
        ) : (
          <ItemPicker items={products} selected={state.products} onChange={updateProducts} />
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4">
        <button
          className="btn-primary"
          disabled={totalSelected === 0}
          onClick={() => navigate('/armar-box/acompanantes')}
        >
          Continuar {totalSelected > 0 && `(${totalSelected} seleccionados)`}
        </button>
      </div>
    </div>
  );
}
