import type { OwnerFlowType, OwnerPropertyIntake } from "../../types";

export const PROPERTY_TYPE_OPTIONS = [
  { value: "departamento", label: "Departamento" },
  { value: "ph", label: "PH" },
  { value: "casa", label: "Casa" },
  { value: "casa-quinta", label: "Casa quinta" },
  { value: "local-comercial", label: "Local comercial" },
  { value: "duplex", label: "Duplex" },
];

export const ROOM_OPTIONS = [
  { value: "mono", label: "Monoambiente" },
  { value: "1", label: "1 ambiente" },
  { value: "2", label: "2 ambientes" },
  { value: "3", label: "3 ambientes" },
  { value: "4", label: "4 ambientes" },
  { value: "5-mas", label: "5 o más ambientes" },
];

export const DOCUMENTATION_OPTIONS = [
  "Título de Propiedad",
  "Declaratoria de Herederos",
  "Sucesión",
  "Otro",
  "Plano",
  "Reglamento de Copropiedad",
  "Resumen de expensas de los últimos 3 meses",
];

export const SERVICE_OPTIONS = [
  "Necesito una tasación",
  "Necesito asesoramiento integral",
  "Necesito asesoramiento legal",
  "Necesito asesoramiento de diseño",
  "Necesito asesoramiento arquitectónico / obra",
];

export const FLOW_LABELS: Record<OwnerFlowType, { title: string; commercialLabel: string }> = {
  rent: { title: "Alquilo", commercialLabel: "Valor de alquiler" },
  sale: { title: "Vendo", commercialLabel: "Valor de venta" },
  opportunity: { title: "Oportunidad", commercialLabel: "Estimativo de obra" },
};

export function emptyOwnerIntake(flowType: OwnerFlowType): OwnerPropertyIntake {
  return {
    flowType,
    owner: { name: "", email: "", phone: "" },
    location: {
      province: "",
      city: "",
      neighborhood: "",
      exactAddress: "",
      showExactAddress: true,
    },
    commercial: {
      marketVisibility: "on-market",
      currency: "ARS",
      amount: undefined,
      estimatedWorkCost: undefined,
    },
    property: { type: "", rooms: "", areaM2: "", hasNaturalGas: false },
    media: { images: [] },
    documentation: { available: [], otherDescription: "", wantsToUpload: false, files: [] },
    requestedServices: [],
    publicationMode: "",
  };
}
