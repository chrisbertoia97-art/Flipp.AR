import Wizard, { type WizardStepDef } from "../wizard/Wizard";
import { TextField, CheckboxGroup, SelectField } from "../../components/fields";
import type { InvestorFlowType, InvestorIntake } from "../../types";
import { submitInvestorIntake } from "../../api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CAPITAL_RANGES = [
  { value: "menos-25k", label: "Menos de USD 25.000" },
  { value: "25k-100k", label: "USD 25.000 - 100.000" },
  { value: "100k-500k", label: "USD 100.000 - 500.000" },
  { value: "mas-500k", label: "Más de USD 500.000" },
];

const INTEREST_OPTIONS = [
  "Flipping residencial",
  "Desarrollos a medida",
  "Preventa de proyectos",
  "Formar equipo con actores",
];

function empty(flowType: InvestorFlowType): InvestorIntake {
  return {
    flowType,
    contact: { name: "", email: "", phone: "" },
    capitalRangeUSD: "",
    interests: [],
    zonesOfInterest: "",
    notes: "",
  };
}

const NOTICE =
  "Este registro es una manifestación de interés. Flipp.AR no procesa fondos reales ni ofrece instrumentos financieros en esta etapa.";

function steps(): WizardStepDef<InvestorIntake>[] {
  return [
    {
      title: "Datos de contacto",
      validate: (d) => {
        const errs: string[] = [];
        if (!d.contact.name.trim()) errs.push("El nombre es obligatorio.");
        if (!EMAIL_RE.test(d.contact.email)) errs.push("Ingresá un email válido.");
        if (!d.contact.phone.trim()) errs.push("El teléfono es obligatorio.");
        return errs;
      },
      render: (d, set) => (
        <div className="space-y-4">
          <TextField label="Nombre" value={d.contact.name} onChange={(v) => set((p) => ({ ...p, contact: { ...p.contact, name: v } }))} />
          <TextField label="Email" type="email" value={d.contact.email} onChange={(v) => set((p) => ({ ...p, contact: { ...p.contact, email: v } }))} />
          <TextField label="Teléfono" value={d.contact.phone} onChange={(v) => set((p) => ({ ...p, contact: { ...p.contact, phone: v } }))} />
          <p className="text-xs text-neutral-500">{NOTICE}</p>
        </div>
      ),
    },
    {
      title: "Preferencias de inversión",
      validate: () => [],
      render: (d, set) => (
        <div className="space-y-4">
          <SelectField
            label="Rango de capital disponible (orientativo)"
            value={d.capitalRangeUSD}
            options={CAPITAL_RANGES}
            onChange={(v) => set((p) => ({ ...p, capitalRangeUSD: v }))}
          />
          <CheckboxGroup label="Áreas de interés" options={INTEREST_OPTIONS} selected={d.interests} onChange={(v) => set((p) => ({ ...p, interests: v }))} />
          <TextField label="Zonas de interés" value={d.zonesOfInterest} onChange={(v) => set((p) => ({ ...p, zonesOfInterest: v }))} placeholder="Ej: CABA, Zona Norte GBA" />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Comentarios adicionales</label>
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

export default function InvestorIntakeWizard({ flowType }: { flowType: InvestorFlowType }) {
  return (
    <Wizard
      steps={steps()}
      initialData={empty(flowType)}
      submitLabel="Enviar"
      onSubmit={async (data) => {
        await submitInvestorIntake(data);
      }}
    />
  );
}
