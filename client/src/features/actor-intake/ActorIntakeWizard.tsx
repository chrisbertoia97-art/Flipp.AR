import Wizard, { type WizardStepDef } from "../wizard/Wizard";
import { TextField, NumberField } from "../../components/fields";
import type { ActorCategory, ActorIntake } from "../../types";
import { submitActorIntake } from "../../api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CATEGORY_LABELS: Record<ActorCategory, string> = {
  "arquitecto-disenador": "Arquitectos / Diseñadores",
  "contratista-director-obra": "Contratistas / Director de obra",
  "especialista-gremio": "Especialistas / Gremios",
  "deco-commodities": "Deco / Commodities",
  "agente-martillero": "Agentes / Martillero/a",
};

function empty(category: ActorCategory): ActorIntake {
  return {
    category,
    contact: { name: "", email: "", phone: "" },
    zone: "",
    specialties: [],
    experienceYears: "",
    description: "",
  };
}

function steps(category: ActorCategory): WizardStepDef<ActorIntake>[] {
  return [
    {
      title: `Registro — ${CATEGORY_LABELS[category]}`,
      validate: (d) => {
        const errs: string[] = [];
        if (!d.contact.name.trim()) errs.push("El nombre es obligatorio.");
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
      title: "Perfil profesional",
      validate: (d) => (d.zone.trim() ? [] : ["Indicá tu zona de cobertura."]),
      render: (d, set) => (
        <div className="space-y-4">
          <TextField label="Zona de cobertura" value={d.zone} onChange={(v) => set((p) => ({ ...p, zone: v }))} placeholder="Ej: CABA, Zona Norte" />
          <TextField
            label="Especialidades (separadas por coma)"
            value={d.specialties.join(", ")}
            onChange={(v) => set((p) => ({ ...p, specialties: v.split(",").map((s) => s.trim()).filter(Boolean) }))}
            placeholder="Ej: demolición, pintura, instalaciones eléctricas"
          />
          <NumberField label="Años de experiencia" value={d.experienceYears} onChange={(v) => set((p) => ({ ...p, experienceYears: v }))} />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Descripción breve</label>
            <textarea
              className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3.5 py-2.5 text-neutral-100 focus:outline-none focus:border-amber-400"
              rows={4}
              value={d.description}
              onChange={(e) => set((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>
      ),
    },
  ];
}

function SelectCategoryStep({ onSelect }: { onSelect: (c: ActorCategory) => void }) {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-xl font-semibold text-neutral-50 mb-6">¿En qué categoría querés registrarte?</h2>
      <div className="space-y-3">
        {(Object.keys(CATEGORY_LABELS) as ActorCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="w-full text-left rounded-xl border border-neutral-700 bg-neutral-900 p-4 hover:border-amber-400 transition"
          >
            <span className="font-medium text-neutral-100">{CATEGORY_LABELS[cat]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { SelectCategoryStep as ActorCategoryPicker };
export type { ActorCategory };

export default function ActorIntakeWizard({ category }: { category: ActorCategory }) {
  return (
    <Wizard
      steps={steps(category)}
      initialData={empty(category)}
      submitLabel="Enviar registro"
      onSubmit={async (data) => {
        await submitActorIntake(data);
      }}
    />
  );
}
