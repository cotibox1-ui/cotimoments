const STEPS = ['PRODUCTOS', 'CAJA', 'PERSONALIZACIÓN', 'ENTREGA', 'CONFIRMACIÓN'];

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-gray-100">
      {STEPS.map((step, i) => {
        const stepNumber = i + 1;
        const active = stepNumber === current;
        const done = stepNumber < current;
        return (
          <div key={step} className="flex-1 flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full text-[11px] flex items-center justify-center font-semibold
                ${active ? 'bg-rose-600 text-white' : done ? 'bg-gold-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {stepNumber}
            </div>
            <span className={`mt-1 text-[9px] text-center ${active ? 'text-rose-600 font-semibold' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
