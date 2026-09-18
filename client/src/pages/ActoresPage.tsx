import { useParams } from "react-router-dom";
import ActorIntakeWizard from "../features/actor-intake/ActorIntakeWizard";
import type { ActorCategory } from "../types";

const VALID_CATEGORIES: ActorCategory[] = [
  "arquitecto-disenador",
  "contratista-director-obra",
  "especialista-gremio",
  "deco-commodities",
  "agente-martillero",
];

export default function ActoresPage() {
  const { category } = useParams<{ category: string }>();
  if (!category || !VALID_CATEGORIES.includes(category as ActorCategory)) {
    return <p className="text-center py-20 text-neutral-400">Categoría no encontrada.</p>;
  }
  return <ActorIntakeWizard category={category as ActorCategory} />;
}
