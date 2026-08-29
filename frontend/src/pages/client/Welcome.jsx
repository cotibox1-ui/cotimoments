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
    <div className="min-h-screen flex flex-col lg:block bg-white">
      {/* ---- Móvil: banner arriba + tarjeta abajo (sin cambios) ---- */}
      <div className="lg:hidden relative h-[42vh] min-h-[280px] bg-gradient-to-br from-rose-100 via-rose-50 to-white overflow-hidden rounded-b-[2.5rem] shadow-soft">
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

      <div className="lg:hidden flex-1 flex flex-col items-center justify-center px-6 text-center -mt-6">
        <div className="bg-white rounded-3xl shadow-soft px-6 py-8 w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">{messages.welcomeTitle}</h1>
          <p className="text-ink-400 mb-8 text-sm leading-relaxed">{messages.welcomeSubtitle}</p>
          <button className="btn-primary" onClick={() => navigate('/armar-box/productos')}>
            {messages.welcomeButton}
          </button>
        </div>
      </div>

      {/* ---- Desktop: dos columnas, foto grande a la izquierda, contenido a la derecha ---- */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:min-h-screen">
        <div className="relative h-full bg-gradient-to-br from-rose-100 via-rose-50 to-white overflow-hidden">
          {heroImage ? (
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src={logoUrl} alt="" className="w-64 h-64 rounded-full object-cover shadow-soft ring-8 ring-white" />
            </div>
          )}
          <Sparkles className="absolute top-10 left-10 w-6 h-6 text-white/70" strokeWidth={1.5} />
          <Sparkles className="absolute bottom-14 right-14 w-5 h-5 text-white/60" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col items-start justify-center px-16 xl:px-24">
          <h1 className="font-display text-5xl font-bold text-ink-900 mb-4 leading-tight">{messages.welcomeTitle}</h1>
          <p className="text-ink-400 mb-10 text-lg leading-relaxed max-w-md">{messages.welcomeSubtitle}</p>
          <button className="btn-primary lg:w-auto lg:px-10 lg:py-4 lg:text-base" onClick={() => navigate('/armar-box/productos')}>
            {messages.welcomeButton}
          </button>
        </div>
      </div>
    </div>
  );
}
