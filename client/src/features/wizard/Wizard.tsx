import { useState, type ReactNode } from "react";
import ProgressBar from "./ProgressBar";

export interface WizardStepDef<T> {
  title: string;
  /** Debe devolver un array de errores (vacío = válido) para los campos de ESTE paso solamente. */
  validate: (data: T) => string[];
  render: (data: T, setData: (updater: (prev: T) => T) => void, errors: string[]) => ReactNode;
}

interface Props<T> {
  steps: WizardStepDef<T>[];
  initialData: T;
  onSubmit: (data: T) => Promise<void>;
  submitLabel?: string;
}

/**
 * Wizard genérico y reutilizable: recibe una lista de pasos con su propio render + validación,
 * y maneja el estado del formulario completo, la navegación y el envío final.
 * Se usa igual para Propietarios, Actores, Inversores y Proveedores, cambiando solo `steps`.
 */
export default function Wizard<T>({ steps, initialData, onSubmit, submitLabel = "Enviar" }: Props<T>) {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isLast = stepIndex === steps.length - 1;
  const current = steps[stepIndex];

  function setDataScoped(updater: (prev: T) => T) {
    setData((prev) => updater(prev));
  }

  function goNext() {
    const stepErrors = current.validate(data);
    setErrors(stepErrors);
    if (stepErrors.length > 0) return;
    if (isLast) {
      handleSubmit();
    } else {
      setStepIndex((i) => i + 1);
      setErrors([]);
    }
  }

  function goBack() {
    setErrors([]);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(data);
      setDone(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Error inesperado al enviar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <div className="text-amber-400 text-4xl mb-4">✓</div>
        <h2 className="text-2xl font-semibold text-neutral-50 mb-3">Recibido</h2>
        <p className="text-neutral-400">
          Recibimos tu información. Un asesor de Flipp.AR revisará los datos y se pondrá en
          contacto para continuar el proceso.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <ProgressBar current={stepIndex + 1} total={steps.length} title={current.title} />

      <div className="mb-8">{current.render(data, setDataScoped, errors)}</div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          {errors.map((err) => (
            <p key={err} className="text-sm text-red-400">
              {err}
            </p>
          ))}
        </div>
      )}

      {submitError && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0 || submitting}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-300 border border-neutral-700 disabled:opacity-30 hover:border-neutral-500 transition"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-amber-400 text-neutral-950 hover:bg-amber-300 transition disabled:opacity-50"
        >
          {submitting ? "Enviando..." : isLast ? submitLabel : "Continuar"}
        </button>
      </div>
    </div>
  );
}
