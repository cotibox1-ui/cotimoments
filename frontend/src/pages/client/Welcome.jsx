import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
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
  const heroImage = config?.referenceImageUrl;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero: foto referencial configurada, o un panel decorativo con el logo si aún no hay ninguna */}
      <div className="relative h-[42vh] min-h-[280px] bg-gradient-to-br from-rose-100 via-rose-50 to-white overflow-hidden rounded-b-[2.5rem] shadow-soft">
        {heroImage ? (
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src={logoUrl} alt="" className="w-36 h-36 rounded-full object-cover shadow-soft ring-4 ring-white" />
          </div>
        )}
        <Sparkles className="absolute top-6 left-6 w-5 h-5 text-white/70" strokeWidth={1.5} />
        <Sparkles className="absolute bottom-8 right-8 w-4 h-4 text-white/60" strokeWidth={1.5} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center -mt-6">
        <div className="bg-white rounded-3xl shadow-soft px-6 py-8 w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">{messages.welcomeTitle}</h1>
          <p className="text-ink-400 mb-8 text-sm leading-relaxed">{messages.welcomeSubtitle}</p>
          <button className="btn-primary" onClick={() => navigate('/armar-box/productos')}>
            {messages.welcomeButton}
          </button>
        </div>
      </div>
    </div>
  );
}
