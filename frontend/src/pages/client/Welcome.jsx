import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import api from '../../api/client';

export default function Welcome() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/configuration/public').then((res) => setConfig(res.data));
  }, []);

  const messages = config?.messages || {
    welcomeTitle: 'Prepárate para armar tu box',
    welcomeSubtitle:
      'Selecciona tus productos favoritos y personaliza cada detalle para crear un regalo único.',
    welcomeButton: 'COMENZAR A ARMAR MI BOX',
  };

  // Si configuras un logo distinto desde el Dashboard (Cloudinary), ese
  // tiene prioridad. Si no, se usa el logo del proyecto por defecto.
  const logoUrl = config?.business?.logoUrl || logo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-rose-50">
      <img src={logoUrl} alt="Momentos Divertidos" className="w-28 h-28 rounded-full object-cover mb-6" />
      <h1 className="font-display text-3xl font-bold text-rose-600 mb-3">{messages.welcomeTitle}</h1>
      <p className="text-gray-500 mb-10 max-w-sm">{messages.welcomeSubtitle}</p>
      <button className="btn-primary max-w-xs" onClick={() => navigate('/armar-box/productos')}>
        {messages.welcomeButton}
      </button>
    </div>
  );
}
