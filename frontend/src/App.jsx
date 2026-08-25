import { Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { BoxBuilderProvider } from './context/BoxBuilderContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import RequireAdmin from './components/RequireAdmin';

import Welcome from './pages/client/Welcome';
import StepProducts from './pages/client/StepProducts';
import StepCompanions from './pages/client/StepCompanions';
import StepBox from './pages/client/StepBox';
import StepCustomization from './pages/client/StepCustomization';
import StepDelivery from './pages/client/StepDelivery';
import StepConfirmation from './pages/client/StepConfirmation';
import OrderCreated from './pages/client/OrderCreated';
import ProposalView from './pages/client/ProposalView';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import OrdersDashboard from './pages/admin/OrdersDashboard';
import OrderDetail from './pages/admin/OrderDetail';
import ProductsPage from './pages/admin/ProductsPage';
import BoxesPage from './pages/admin/BoxesPage';
import DecorationsPage from './pages/admin/DecorationsPage';
import CompanionsPage from './pages/admin/CompanionsPage';
import ProposalsPage from './pages/admin/ProposalsPage';
import ConfigurationPage from './pages/admin/ConfigurationPage';

// Dentro de la APK (Capacitor nativo) el sistema es SOLO administrativo
// (sección 45): la raíz "/" debe llevar al login del admin, nunca al
// flujo de armado de box del cliente.
const rootRedirect = Capacitor.isNativePlatform() ? '/admin' : '/armar-box';

export default function App() {
  return (
    <AdminAuthProvider>
      <BoxBuilderProvider>
        <Routes>
          {/* ---- CLIENTE ---- */}
          <Route path="/" element={<Navigate to={rootRedirect} replace />} />
          <Route path="/armar-box" element={<Welcome />} />
          <Route path="/armar-box/productos" element={<StepProducts />} />
          <Route path="/armar-box/acompanantes" element={<StepCompanions />} />
          <Route path="/armar-box/caja" element={<StepBox />} />
          <Route path="/armar-box/personalizacion" element={<StepCustomization />} />
          <Route path="/armar-box/entrega" element={<StepDelivery />} />
          <Route path="/armar-box/confirmacion" element={<StepConfirmation />} />
          <Route path="/pedido/:orderNumber" element={<OrderCreated />} />
          <Route path="/propuesta/:publicId" element={<ProposalView />} />

          {/* ---- ADMIN ---- */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<OrdersDashboard />} />
            <Route path="pedidos/:id" element={<OrderDetail />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path="cajas" element={<BoxesPage />} />
            <Route path="decoracion" element={<DecorationsPage />} />
            <Route path="acompanantes" element={<CompanionsPage />} />
            <Route path="propuestas" element={<ProposalsPage />} />
            <Route path="configuracion" element={<ConfigurationPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/armar-box" replace />} />
        </Routes>
      </BoxBuilderProvider>
    </AdminAuthProvider>
  );
}
