import { useState } from "react";
import { Link } from "react-router-dom";

interface MenuItem {
  label: string;
  items: { label: string; to: string }[];
}

const MENU: MenuItem[] = [
  {
    label: "Quiénes somos",
    items: [
      { label: "Ecosistema", to: "/quienes-somos/ecosistema" },
      { label: "Consultas frecuentes", to: "/quienes-somos/consultas-frecuentes" },
      { label: "Contacto", to: "/quienes-somos/contacto" },
    ],
  },
  {
    label: "Propietarios",
    items: [
      { label: "Alquilo", to: "/propietarios/alquilo" },
      { label: "Vendo", to: "/propietarios/vendo" },
      { label: "Oportunidad", to: "/propietarios/oportunidad" },
    ],
  },
  {
    label: "Inversores",
    items: [
      { label: "Inscribirse", to: "/inversores/inscribirse" },
      { label: "Formar equipo", to: "/inversores/formar-equipo" },
      { label: "Iniciar compra", to: "/inversores/iniciar-compra" },
    ],
  },
  {
    label: "El Semillero",
    items: [
      { label: "Cursos", to: "/semillero/cursos" },
      { label: "Hechos", to: "/semillero/hechos" },
    ],
  },
  {
    label: "Proyectos",
    items: [
      { label: "Iniciados", to: "/proyectos/iniciados" },
      { label: "Preventa", to: "/proyectos/preventa" },
      { label: "A medida", to: "/proyectos/a-medida" },
    ],
  },
  {
    label: "Actores",
    items: [
      { label: "Arquitectos / Diseñadores", to: "/actores/arquitecto-disenador" },
      { label: "Contratistas / Director de obra", to: "/actores/contratista-director-obra" },
      { label: "Especialistas / Gremios", to: "/actores/especialista-gremio" },
      { label: "Deco / Commodities", to: "/actores/deco-commodities" },
      { label: "Agentes / Martillero/a", to: "/actores/agente-martillero" },
    ],
  },
];

export default function NavBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight text-amber-400">
          Flipp<span className="text-neutral-100">.AR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {MENU.map((menu) => (
            <div
              key={menu.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(menu.label)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button className="px-3 py-2 text-sm text-neutral-300 hover:text-amber-400 transition">
                {menu.label}
              </button>
              {openMenu === menu.label && (
                <div className="absolute top-full left-0 min-w-[220px] rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl py-1.5">
                  {menu.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-amber-400 transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/proveedores" className="px-3 py-2 text-sm text-neutral-300 hover:text-amber-400 transition">
            Proveedores
          </Link>
        </nav>

        <button
          className="md:hidden text-neutral-300"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {MENU.map((menu) => (
            <div key={menu.label}>
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">{menu.label}</p>
              <div className="space-y-1 pl-2">
                {menu.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1 text-sm text-neutral-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link to="/proveedores" onClick={() => setMobileOpen(false)} className="block py-1 text-sm text-neutral-300">
            Proveedores
          </Link>
        </div>
      )}
    </header>
  );
}
