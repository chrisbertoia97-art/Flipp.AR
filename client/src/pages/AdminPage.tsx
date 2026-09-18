import { useEffect, useState } from "react";
import { adminGetSummary, adminList, adminLogin } from "../api/client";

type Resource = "propietarios" | "actores" | "inversores" | "proveedores";

const RESOURCES: { key: Resource; label: string }[] = [
  { key: "propietarios", label: "Propietarios" },
  { key: "actores", label: "Actores" },
  { key: "inversores", label: "Inversores" },
  { key: "proveedores", label: "Proveedores" },
];

interface Row {
  id: string;
  created_at: string;
  data: Record<string, unknown>;
}

function extractContact(row: Row) {
  const d = row.data as unknown as { owner?: { name?: string; email?: string }; contact?: { name?: string; email?: string } };
  const name = d.owner?.name ?? d.contact?.name ?? "—";
  const email = d.owner?.email ?? d.contact?.email ?? "—";
  return { name, email };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<Resource, number> | null>(null);
  const [active, setActive] = useState<Resource>("propietarios");
  const [rows, setRows] = useState<Row[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    try {
      await adminLogin(password);
      setAuthed(true);
      sessionStorage.setItem("flippar_admin_pw", password);
    } catch {
      setLoginError("Contraseña incorrecta.");
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("flippar_admin_pw");
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    adminGetSummary(password).then(setSummary).catch(() => setAuthed(false));
  }, [authed, password]);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    adminList(active, password)
      .then(setRows)
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false));
  }, [authed, active, password]);

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-24 px-4">
        <h1 className="text-xl font-semibold text-neutral-50 mb-6">Acceso administrador</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3.5 py-2.5 text-neutral-100 focus:outline-none focus:border-amber-400"
          />
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          <button type="submit" className="w-full px-5 py-2.5 rounded-lg bg-amber-400 text-neutral-950 font-semibold text-sm">
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-xl font-semibold text-neutral-50 mb-6">Panel de solicitudes</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {RESOURCES.map((r) => (
            <div key={r.key} className="rounded-xl border border-neutral-700 bg-neutral-900 p-4">
              <p className="text-2xl font-bold text-amber-400">{summary[r.key]}</p>
              <p className="text-xs text-neutral-500 mt-1">{r.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-neutral-800">
        {RESOURCES.map((r) => (
          <button
            key={r.key}
            onClick={() => setActive(r.key)}
            className={`px-4 py-2 text-sm border-b-2 transition ${
              active === r.key ? "border-amber-400 text-amber-400" : "border-transparent text-neutral-400"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-neutral-500 text-sm">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-neutral-500 text-sm">Todavía no hay solicitudes en esta categoría.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const { name, email } = extractContact(row);
            const isOpen = expanded === row.id;
            return (
              <div key={row.id} className="rounded-lg border border-neutral-700 bg-neutral-900">
                <button
                  onClick={() => setExpanded(isOpen ? null : row.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-sm text-neutral-100">
                    {name} <span className="text-neutral-500">· {email}</span>
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(row.created_at).toLocaleString("es-AR")}
                  </span>
                </button>
                {isOpen && (
                  <pre className="border-t border-neutral-800 px-4 py-3 text-xs text-neutral-400 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(row.data, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
