const STEPS = ['PRODUCTOS', 'ACOMPAÑANTES', 'CAJA', 'PERSONALIZACIÓN', 'ENTREGA', 'CONFIRMACIÓN'];

export default function StepIndicator({ current }) {
  const progress = (current / STEPS.length) * 100;

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-1 px-4 pt-3 pb-2 overflow-x-auto">
        {STEPS.map((step, i) => {
          const stepNumber = i + 1;
          const active = stepNumber === current;
          const done = stepNumber < current;
          return (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <span
                className={`text-[10px] font-bold tracking-wide transition-colors ${
                  active ? 'text-rose-600' : done ? 'text-gold-500' : 'text-gray-300'
                }`}
              >
                {String(stepNumber).padStart(2, '0')}
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  active ? 'text-ink-900' : done ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                {step}
              </span>
              {i < STEPS.length - 1 && <span className="text-gray-200 mx-0.5">·</span>}
            </div>
          );
        })}
      </div>
      <div className="h-[3px] bg-rose-50">
        <div className="h-full bg-rose-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
