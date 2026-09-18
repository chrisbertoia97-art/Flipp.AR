// ---------- PROPIETARIOS ----------
export type OwnerFlowType = "rent" | "sale" | "opportunity";

export type PropertyType =
  | "departamento"
  | "ph"
  | "casa"
  | "casa-quinta"
  | "local-comercial"
  | "duplex";

export type RoomCount =
  | "mono"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5-mas";

export type MarketVisibility = "on-market" | "off-market";

export type PublicationMode = "exclusive" | "non-exclusive" | "exclusive-plus";

export interface OwnerPropertyIntake {
  flowType: OwnerFlowType;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  location: {
    province: string;
    city: string;
    neighborhood: string;
    exactAddress: string;
    showExactAddress: boolean;
  };
  commercial: {
    marketVisibility: MarketVisibility;
    currency: "ARS" | "USD";
    amount?: number; // usado en rent / sale
    estimatedWorkCost?: number; // usado en opportunity
  };
  property: {
    type: PropertyType | "";
    rooms: RoomCount | "";
    areaM2: number | "";
    hasNaturalGas: boolean;
  };
  media: {
    images: File[]; // archivos reales seleccionados por el usuario; se suben aparte al backend
  };
  documentation: {
    available: string[];
    otherDescription?: string;
    wantsToUpload: boolean;
    files: File[]; // ídem: archivos reales
  };
  requestedServices: string[];
  publicationMode: PublicationMode | "";
}

// ---------- ACTORES ----------
export type ActorCategory =
  | "arquitecto-disenador"
  | "contratista-director-obra"
  | "especialista-gremio"
  | "deco-commodities"
  | "agente-martillero";

export interface ActorIntake {
  category: ActorCategory;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  zone: string;
  specialties: string[];
  experienceYears: number | "";
  description: string;
}

// ---------- INVERSORES ----------
export type InvestorFlowType = "inscribirse" | "formar-equipo" | "iniciar-compra";

export interface InvestorIntake {
  flowType: InvestorFlowType;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  capitalRangeUSD: string;
  interests: string[];
  zonesOfInterest: string;
  notes: string;
}

// ---------- PROVEEDORES ----------
export interface ProviderIntake {
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  category: string;
  materials: string;
  coverageZone: string;
  notes: string;
}
