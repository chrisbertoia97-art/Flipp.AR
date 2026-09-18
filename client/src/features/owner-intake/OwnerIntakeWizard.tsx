import Wizard, { type WizardStepDef } from "../wizard/Wizard";
import {
  TextField,
  NumberField,
  SelectField,
  SwitchField,
  CheckboxGroup,
} from "../../components/fields";
import type { OwnerFlowType, OwnerPropertyIntake } from "../../types";
import {
  DOCUMENTATION_OPTIONS,
  FLOW_LABELS,
  PROPERTY_TYPE_OPTIONS,
  ROOM_OPTIONS,
  SERVICE_OPTIONS,
  emptyOwnerIntake,
} from "./ownerIntake.constants";
import { PROVINCE_NAMES, getCitiesForProvince, getNeighborhoodsForCity } from "../../data/locations";
import { submitOwnerIntake, uploadOwnerImages, uploadOwnerDocuments } from "../../api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fileListToArray(files: FileList | null): File[] {
  if (!files) return [];
  return Array.from(files);
}

function buildSteps(flowType: OwnerFlowType): WizardStepDef<OwnerPropertyIntake>[] {
  const flowMeta = FLOW_LABELS[flowType];

  return [
    // PASO 1 — Contacto
    {
      title: "Información de contacto",
      validate: (d) => {
        const errs: string[] = [];
        if (!d.owner.name.trim()) errs.push("El nombre es obligatorio.");
        if (!EMAIL_RE.test(d.owner.email)) errs.push("Ingresá un email válido.");
        if (!d.owner.phone.trim()) errs.push("El teléfono es obligatorio.");
        return errs;
      },
      render: (d, set) => (
        <div className="space-y-4">
          <TextField label="Nombre" value={d.owner.name} onChange={(v) => set((p) => ({ ...p, owner: { ...p.owner, name: v } }))} />
          <TextField label="Email" type="email" value={d.owner.email} onChange={(v) => set((p) => ({ ...p, owner: { ...p.owner, email: v } }))} />
          <TextField label="Teléfono / Celular" value={d.owner.phone} onChange={(v) => set((p) => ({ ...p, owner: { ...p.owner, phone: v } }))} />
        </div>
      ),
    },

    // PASO 2 — Ubicación
    {
      title: "Ubicación de la propiedad",
      validate: (d) => {
        const errs: string[] = [];
        if (!d.location.province) errs.push("Seleccioná una provincia.");
        if (!d.location.city) errs.push("Seleccioná una ciudad/localidad.");
        if (!d.location.exactAddress.trim()) errs.push("La dirección exacta es obligatoria (se usa internamente).");
        return errs;
      },
      render: (d, set) => {
        const cities = getCitiesForProvince(d.location.province);
        const neighborhoods = getNeighborhoodsForCity(d.location.province, d.location.city);
        return (
          <div className="space-y-4">
            <SelectField
              label="Provincia"
              value={d.location.province}
              options={PROVINCE_NAMES.map((p) => ({ value: p, label: p }))}
              onChange={(v) => set((p) => ({ ...p, location: { ...p.location, province: v, city: "", neighborhood: "" } }))}
            />
            {d.location.province && (
              <SelectField
                label="Ciudad / Localidad"
                value={d.location.city}
                options={cities.map((c) => ({ value: c.name, label: c.name }))}
                onChange={(v) => set((p) => ({ ...p, location: { ...p.location, city: v, neighborhood: "" } }))}
              />
            )}
            {d.location.city && neighborhoods.length > 0 && (
              <SelectField
                label="Barrio / Zona"
                value={d.location.neighborhood}
                options={neighborhoods.map((n) => ({ value: n, label: n }))}
                onChange={(v) => set((p) => ({ ...p, location: { ...p.location, neighborhood: v } }))}
              />
            )}
            <TextField
              label="Dirección exacta"
              value={d.location.exactAddress}
              onChange={(v) => set((p) => ({ ...p, location: { ...p.location, exactAddress: v } }))}
              help="Se usa para la gestión interna. Su visibilidad pública se controla con la opción de abajo."
            />
            <SwitchField
              label="¿Desea mostrar la dirección exacta?"
              value={d.location.showExactAddress}
              onChange={(v) => set((p) => ({ ...p, location: { ...p.location, showExactAddress: v } }))}
              onLabel="Se muestra la dirección exacta"
              offLabel="Se muestra solo ubicación aproximada"
              help="Si desactiva esta opción, la publicación mostrará únicamente una ubicación aproximada."
            />
            <SwitchField
              label="Modalidad de comercialización"
              value={d.commercial.marketVisibility === "on-market"}
              onChange={(v) =>
                set((p) => ({ ...p, commercial: { ...p.commercial, marketVisibility: v ? "on-market" : "off-market" } }))
              }
              onLabel="On market: puede publicarse y promocionarse dentro del ecosistema"
              offLabel="Off market: puede evaluarse y ofrecerse de forma privada"
            />
          </div>
        );
      },
    },

    // PASO 3 — Características + imágenes
    {
      title: "Características de la propiedad",
      validate: (d) => {
        const errs: string[] = [];
        if (!d.property.type) errs.push("Seleccioná el tipo de propiedad.");
        if (!d.property.rooms) errs.push("Seleccioná la cantidad de ambientes.");
        if (d.property.areaM2 === "" || Number(d.property.areaM2) <= 0) errs.push("Ingresá los m² de la propiedad.");
        return errs;
      },
      render: (d, set) => (
        <div className="space-y-4">
          <SelectField
            label="Tipo de propiedad"
            value={d.property.type}
            options={PROPERTY_TYPE_OPTIONS}
            onChange={(v) => set((p) => ({ ...p, property: { ...p.property, type: v as OwnerPropertyIntake["property"]["type"] } }))}
          />
          <SelectField
            label="Ambientes"
            value={d.property.rooms}
            options={ROOM_OPTIONS}
            onChange={(v) => set((p) => ({ ...p, property: { ...p.property, rooms: v as OwnerPropertyIntake["property"]["rooms"] } }))}
          />
          <NumberField
            label="M² de la propiedad"
            value={d.property.areaM2}
            onChange={(v) => set((p) => ({ ...p, property: { ...p.property, areaM2: v } }))}
            min={1}
          />
          <SwitchField
            label="¿La propiedad cuenta con gas natural?"
            value={d.property.hasNaturalGas}
            onChange={(v) => set((p) => ({ ...p, property: { ...p.property, hasNaturalGas: v } }))}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Imágenes de la propiedad</label>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) =>
                set((p) => ({ ...p, media: { images: [...p.media.images, ...fileListToArray(e.target.files)] } }))
              }
              className="block w-full text-sm text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-950"
            />
            <p className="mt-1.5 text-xs text-neutral-500">Formatos: JPG, PNG, WEBP. Máx. 8MB por imagen — se suben de verdad al confirmar la pre-carga.</p>
            {d.media.images.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {d.media.images.map((img, idx) => (
                  <li key={`${img.name}-${idx}`} className="flex items-center justify-between text-sm text-neutral-300 bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-700">
                    <span className="truncate">{img.name} · {Math.round(img.size / 1024)} KB · <em className="text-amber-400 not-italic">Archivo seleccionado</em></span>
                    <button
                      type="button"
                      onClick={() => set((p) => ({ ...p, media: { images: p.media.images.filter((_, i) => i !== idx) } }))}
                      className="text-neutral-500 hover:text-red-400 ml-3"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ),
    },

    // PASO 4 — Documentación
    {
      title: "Documentación",
      validate: (d) => {
        const errs: string[] = [];
        if (d.documentation.available.includes("Otro") && !d.documentation.otherDescription?.trim()) {
          errs.push("Indicá qué otro documento posee.");
        }
        return errs;
      },
      render: (d, set) => (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">¿Usted cuenta con los siguientes documentos de la propiedad?</p>
          <CheckboxGroup
            label="Documentación disponible"
            options={DOCUMENTATION_OPTIONS}
            selected={d.documentation.available}
            onChange={(v) => set((p) => ({ ...p, documentation: { ...p.documentation, available: v } }))}
          />
          {d.documentation.available.includes("Otro") && (
            <TextField
              label="Indique qué otro documento posee"
              value={d.documentation.otherDescription ?? ""}
              onChange={(v) => set((p) => ({ ...p, documentation: { ...p.documentation, otherDescription: v } }))}
            />
          )}
          <SwitchField
            label="¿Desea cargar ahora alguno de estos documentos?"
            value={d.documentation.wantsToUpload}
            onChange={(v) => set((p) => ({ ...p, documentation: { ...p.documentation, wantsToUpload: v } }))}
          />
          {d.documentation.wantsToUpload && (
            <div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  set((p) => ({
                    ...p,
                    documentation: { ...p.documentation, files: [...p.documentation.files, ...fileListToArray(e.target.files)] },
                  }))
                }
                className="block w-full text-sm text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-950"
              />
              {d.documentation.files.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {d.documentation.files.map((f, idx) => (
                    <li key={`${f.name}-${idx}`} className="flex items-center justify-between text-sm text-neutral-300 bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-700">
                      <span className="truncate">{f.name} · {Math.round(f.size / 1024)} KB · <em className="text-amber-400 not-italic">Archivo seleccionado</em></span>
                      <button
                        type="button"
                        onClick={() =>
                          set((p) => ({ ...p, documentation: { ...p.documentation, files: p.documentation.files.filter((_, i) => i !== idx) } }))
                        }
                        className="text-neutral-500 hover:text-red-400 ml-3"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ),
    },

    // PASO 5 — Valor comercial + servicios
    {
      title: "Valor y servicios",
      validate: (d) => {
        const errs: string[] = [];
        if (flowType === "opportunity") {
          if (!d.commercial.estimatedWorkCost || d.commercial.estimatedWorkCost <= 0) errs.push("Ingresá un estimativo de obra.");
        } else {
          if (!d.commercial.amount || d.commercial.amount <= 0) errs.push(`Ingresá ${flowMeta.commercialLabel.toLowerCase()}.`);
        }
        return errs;
      },
      render: (d, set) => (
        <div className="space-y-4">
          <SelectField
            label="Moneda"
            value={d.commercial.currency}
            options={[{ value: "ARS", label: "ARS" }, { value: "USD", label: "USD" }]}
            onChange={(v) => set((p) => ({ ...p, commercial: { ...p.commercial, currency: v as "ARS" | "USD" } }))}
          />
          {flowType === "opportunity" ? (
            <>
              <NumberField
                label="Estimativo de obra"
                value={d.commercial.estimatedWorkCost ?? ""}
                onChange={(v) => set((p) => ({ ...p, commercial: { ...p.commercial, estimatedWorkCost: v === "" ? undefined : Number(v) } }))}
              />
              <p className="text-xs text-neutral-500">Este importe es estimativo y será validado posteriormente.</p>
            </>
          ) : (
            <NumberField
              label={flowMeta.commercialLabel}
              value={d.commercial.amount ?? ""}
              onChange={(v) => set((p) => ({ ...p, commercial: { ...p.commercial, amount: v === "" ? undefined : Number(v) } }))}
            />
          )}

          <CheckboxGroup
            label="¿Qué tipo de asesoramiento necesita?"
            options={SERVICE_OPTIONS}
            selected={d.requestedServices}
            onChange={(v) => set((p) => ({ ...p, requestedServices: v }))}
          />
          {d.requestedServices.length >= 2 && (
            <p className="rounded-lg bg-amber-400/10 border border-amber-400/30 px-3.5 py-2.5 text-sm text-amber-300">
              Asesoramiento integral
            </p>
          )}
        </div>
      ),
    },

    // PASO 6 — Exclusividad
    {
      title: "Modalidad de publicación",
      validate: (d) => (d.publicationMode ? [] : ["Elegí una modalidad de publicación."]),
      render: (d, set) => (
        <div className="space-y-4">
          {[
            {
              key: "exclusive" as const,
              name: "Exclusiva",
              points: [
                "Coordinación comercial centralizada",
                "Estrategia de publicación",
                "Seguimiento unificado",
                "Mayor control de la comercialización",
              ],
              note: "El propietario trabaja bajo un esquema de exclusividad acordado.",
            },
            {
              key: "non-exclusive" as const,
              name: "No exclusiva",
              points: [
                "Puede trabajar con diferentes inmobiliarias/agentes",
                "Mayor cantidad potencial de canales",
              ],
              note: "Menor control sobre la estrategia comercial.",
            },
            {
              key: "exclusive-plus" as const,
              name: "Exclusiva + Beneficios",
              points: [
                "Todo lo de la modalidad exclusiva",
                "Servicio coordinado y presentación premium",
                "Beneficios adicionales a definir según operación y condiciones comerciales",
              ],
              note: "",
              highlight: true,
            },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => set((p) => ({ ...p, publicationMode: opt.key }))}
              className={`w-full text-left rounded-xl border p-5 transition ${
                d.publicationMode === opt.key
                  ? "border-amber-400 bg-amber-400/10"
                  : opt.highlight
                    ? "border-amber-400/40 bg-neutral-900"
                    : "border-neutral-700 bg-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-neutral-50">{opt.name}</h3>
                {opt.highlight && (
                  <span className="text-[10px] uppercase tracking-wide bg-amber-400 text-neutral-950 rounded-full px-2 py-0.5 font-bold">
                    Recomendada
                  </span>
                )}
              </div>
              <ul className="space-y-1 mb-2">
                {opt.points.map((pt) => (
                  <li key={pt} className="text-sm text-neutral-400">• {pt}</li>
                ))}
              </ul>
              {opt.note && <p className="text-xs text-neutral-500 italic">{opt.note}</p>}
            </button>
          ))}
        </div>
      ),
    },

    // PASO 7 — Revisión y envío
    {
      title: "Iniciar pre-carga",
      validate: () => [],
      render: (d) => (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">
            Un asesor revisará la información enviada para verificar que la propiedad cumpla con
            los estándares de publicación y comercialización de Flipp.AR.
          </p>
          <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4 space-y-2 text-sm">
            <p><span className="text-neutral-500">Contacto:</span> {d.owner.name} · {d.owner.email} · {d.owner.phone}</p>
            <p><span className="text-neutral-500">Ubicación:</span> {d.location.neighborhood || d.location.city}, {d.location.province}</p>
            <p><span className="text-neutral-500">Propiedad:</span> {d.property.type} · {d.property.rooms} amb. · {d.property.areaM2} m²</p>
            <p><span className="text-neutral-500">Documentación:</span> {d.documentation.available.length ? d.documentation.available.join(", ") : "Ninguna seleccionada"}</p>
            <p><span className="text-neutral-500">Servicios solicitados:</span> {d.requestedServices.length ? d.requestedServices.join(", ") : "Ninguno"}</p>
            <p><span className="text-neutral-500">Modalidad:</span> {d.publicationMode}</p>
          </div>
        </div>
      ),
    },
  ];
}

export default function OwnerIntakeWizard({ flowType }: { flowType: OwnerFlowType }) {
  const steps = buildSteps(flowType);
  return (
    <Wizard
      steps={steps}
      initialData={emptyOwnerIntake(flowType)}
      submitLabel="Iniciar la pre-carga"
      onSubmit={async (data) => {
        // El JSON principal no lleva los binarios: van aparte, por multipart, a los
        // endpoints de archivos. Acá solo mandamos metadata liviana para referencia.
        const { media, documentation, ...rest } = data;
        const payload = {
          ...rest,
          media: { images: media.images.map((f) => ({ name: f.name, sizeKB: Math.round(f.size / 1024) })) },
          documentation: {
            ...documentation,
            files: documentation.files.map((f) => ({ name: f.name, sizeKB: Math.round(f.size / 1024) })),
          },
        };
        const { id } = await submitOwnerIntake(payload);
        if (media.images.length > 0) await uploadOwnerImages(id, media.images);
        if (documentation.wantsToUpload && documentation.files.length > 0) {
          await uploadOwnerDocuments(id, documentation.files);
        }
      }}
    />
  );
}
