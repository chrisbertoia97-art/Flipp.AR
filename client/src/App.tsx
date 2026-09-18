import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import PropietariosPage from "./pages/PropietariosPage";
import ActoresPage from "./pages/ActoresPage";
import InversoresPage from "./pages/InversoresPage";
import AdminPage from "./pages/AdminPage";
import ComingSoon from "./pages/ComingSoon";
import ProviderIntakeWizard from "./features/provider-intake/ProviderIntakeWizard";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/propietarios/:subroute" element={<PropietariosPage />} />
          <Route path="/actores/:category" element={<ActoresPage />} />
          <Route path="/inversores/:subroute" element={<InversoresPage />} />
          <Route path="/proveedores" element={<ProviderIntakeWizard />} />

          <Route path="/quienes-somos/:subroute" element={<ComingSoon title="Quiénes somos" />} />
          <Route path="/semillero/:subroute" element={<ComingSoon title="El Semillero" />} />
          <Route path="/proyectos/:subroute" element={<ComingSoon title="Proyectos" />} />

          <Route path="/admin" element={<AdminPage />} />

          <Route path="*" element={<ComingSoon title="Página no encontrada" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
