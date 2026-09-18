import { useParams } from "react-router-dom";
import OwnerIntakeWizard from "../features/owner-intake/OwnerIntakeWizard";
import type { OwnerFlowType } from "../types";

const FLOW_MAP: Record<string, OwnerFlowType> = {
  alquilo: "rent",
  vendo: "sale",
  oportunidad: "opportunity",
};

export default function PropietariosPage() {
  const { subroute } = useParams<{ subroute: string }>();
  const flowType = subroute ? FLOW_MAP[subroute] : undefined;

  if (!flowType) {
    return <p className="text-center py-20 text-neutral-400">Sección no encontrada.</p>;
  }

  return <OwnerIntakeWizard flowType={flowType} />;
}
