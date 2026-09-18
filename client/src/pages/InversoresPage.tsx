import { useParams } from "react-router-dom";
import InvestorIntakeWizard from "../features/investor-intake/InvestorIntakeWizard";
import type { InvestorFlowType } from "../types";

const VALID: InvestorFlowType[] = ["inscribirse", "formar-equipo", "iniciar-compra"];

export default function InversoresPage() {
  const { subroute } = useParams<{ subroute: string }>();
  if (!subroute || !VALID.includes(subroute as InvestorFlowType)) {
    return <p className="text-center py-20 text-neutral-400">Sección no encontrada.</p>;
  }
  return <InvestorIntakeWizard flowType={subroute as InvestorFlowType} />;
}
