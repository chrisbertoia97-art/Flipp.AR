import Wizard, { type WizardStepDef } from "../wizard/Wizard";
import { TextField } from "../../components/fields";
import type { ProviderIntake } from "../../types";
import { submitProviderIntake } from "../../api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function empty(): ProviderIntake {
  return {
    contact: { name: "", email: "", phone: "" },
    category: "",
    materials: "",
    coverageZone: "",
    notes: "",
  };
}

function steps(): WizardStepDef<ProviderIntake>[] {
  return [
    {
      title: "Datos del proveedor",
      validate: (d) => {
        const errs: string[] = [];
        if (!d.contact.name.trim()) errs.push("El nombre / razón social es obligatorio.");
        if (!EMAIL_RE.test(d.contact.email)) errs.push("Ingresá un email válido.");
        if (!d.contact.phone.trim()) errs.push("El teléfono es obligatorio.");
        return errs;
      },
      render: (d, set) => (
        <div className="space-y-4">
          <TextField label="Nombre / Razón social" value={d.contact.name} onChange={(v) => set((p) => ({ ...p, contact: { ...p.contact, name: v } }))} />
          <TextField label="Email" type="email" value={d.contact.email} onChange={(v) => set((p) => ({ ...p, contact: { ...p.contact, email: v } }))} />
          <TextField label="Teléfono" value={d.contact.phone} onChange={(v) => set((p) => ({ ...p, contact: { ...p.contact, phone: v } }))} />
        </div>
      ),
    },
    {
      title: "Materiales y cobertura",
      validate: (d) => (d.category.trim() ? [] : ["Indicá la categoría de materiales/productos."]),
      render: (d, set) => (
        <div className="space-y-4">
          <TextField label="Categoría" value={d.category} onChange={(v) => set((p) => ({ ...p, category: v }))} placeholder="Ej: materiales de construcción, pintura, sanitarios" />
          <TextField label="Materiales / productos principales" value={d.materials} onChange={(v) => set((p) => ({ ...p, materials: v }))} />
          <TextField label="Zona de cobertura" value={d.coverageZone} onChange={(v) => set((p) => ({ ...p, coverageZone: v }))} />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Comentarios</label>
            <textarea
              className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3.5 py-2.5 text-neutral-100 focus:outline-none focus:border-amber-400"
              rows={4}
              value={d.notes}
              onChange={(e) => set((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>
      ),
    },
  ];
}

export default function ProviderIntakeWizard() {
  return (
    <Wizard
      steps={steps()}
      initialData={empty()}
      submitLabel="Enviar registro"
      onSubmit={async (data) => {
        await submitProviderIntake(data);
      }}
    />
  );
}
