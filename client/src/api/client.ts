const BASE_URL = "/api";

async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export async function submitOwnerIntake(payload: unknown): Promise<{ id: string; created_at: string }> {
  const res = await fetch(`${BASE_URL}/propietarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function uploadOwnerImages(ownerId: string, files: File[]) {
  if (files.length === 0) return;
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  const res = await fetch(`${BASE_URL}/propietarios/${ownerId}/imagenes`, { method: "POST", body: form });
  return handle(res);
}

export async function uploadOwnerDocuments(ownerId: string, files: File[]) {
  if (files.length === 0) return;
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${BASE_URL}/propietarios/${ownerId}/documentos`, { method: "POST", body: form });
  return handle(res);
}

export async function submitActorIntake(payload: unknown) {
  const res = await fetch(`${BASE_URL}/actores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function submitInvestorIntake(payload: unknown) {
  const res = await fetch(`${BASE_URL}/inversores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function submitProviderIntake(payload: unknown) {
  const res = await fetch(`${BASE_URL}/proveedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// ---------- ADMIN ----------
export async function adminLogin(password: string) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return handle(res);
}

function authHeaders(password: string) {
  return { "x-admin-password": password };
}

export async function adminGetSummary(password: string) {
  const res = await fetch(`${BASE_URL}/admin/summary`, { headers: authHeaders(password) });
  return handle(res);
}

export async function adminList(resource: "propietarios" | "actores" | "inversores" | "proveedores", password: string) {
  const res = await fetch(`${BASE_URL}/${resource}`, { headers: authHeaders(password) });
  return handle(res);
}
