import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center">
      <p className="text-xs uppercase tracking-wide text-amber-400 mb-3">Ecosistema inmobiliario</p>
      <h1 className="text-4xl font-bold text-neutral-50 mb-4">Flipp.AR</h1>
      <p className="text-neutral-400 max-w-xl mx-auto mb-10">
        Convertí tu propiedad en un proyecto. Sumate como propietario, inversor, actor
        profesional o proveedor.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/propietarios/vendo" className="px-5 py-2.5 rounded-lg bg-amber-400 text-neutral-950 font-semibold text-sm">
          Publicar mi propiedad
        </Link>
        <Link to="/actores/contratista-director-obra" className="px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-200 text-sm">
          Registrarme como actor
        </Link>
        <Link to="/inversores/inscribirse" className="px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-200 text-sm">
          Soy inversor
        </Link>
        <Link to="/proveedores" className="px-5 py-2.5 rounded-lg border border-neutral-700 text-neutral-200 text-sm">
          Soy proveedor
        </Link>
      </div>
    </div>
  );
}
