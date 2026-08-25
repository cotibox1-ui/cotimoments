import { createContext, useContext, useState } from 'react';

const BoxBuilderContext = createContext(null);

const initialState = {
  products: [], // [{ productId, name, quantity }]
  companions: [], // [{ productId, name, quantity }]
  boxId: null,
  boxName: '',
  decorationIds: [],
  customization: {
    theme: '',
    predominantColors: '',
    hasDedication: false,
    dedicationText: '',
    cardStyleDescription: '',
  },
  delivery: {
    fromName: '',
    toName: '',
    contactPhone: '',
    wanted: false,
    address: '',
    time: '',
    references: '',
  },
};

// Mantiene toda la selección del cliente en memoria mientras navega entre
// pasos (sección 46: "No perder la información seleccionada" al regresar).
export function BoxBuilderProvider({ children }) {
  const [state, setState] = useState(initialState);

  const updateProducts = (products) => setState((s) => ({ ...s, products }));
  const updateCompanions = (companions) => setState((s) => ({ ...s, companions }));
  const updateBox = (boxId, boxName) => setState((s) => ({ ...s, boxId, boxName }));
  const updateDecorations = (decorationIds) => setState((s) => ({ ...s, decorationIds }));
  const updateCustomization = (customization) =>
    setState((s) => ({ ...s, customization: { ...s.customization, ...customization } }));
  const updateDelivery = (delivery) => setState((s) => ({ ...s, delivery: { ...s.delivery, ...delivery } }));
  const reset = () => setState(initialState);

  return (
    <BoxBuilderContext.Provider
      value={{
        state,
        updateProducts,
        updateCompanions,
        updateBox,
        updateDecorations,
        updateCustomization,
        updateDelivery,
        reset,
      }}
    >
      {children}
    </BoxBuilderContext.Provider>
  );
}

export function useBoxBuilder() {
  const ctx = useContext(BoxBuilderContext);
  if (!ctx) throw new Error('useBoxBuilder debe usarse dentro de BoxBuilderProvider');
  return ctx;
}
