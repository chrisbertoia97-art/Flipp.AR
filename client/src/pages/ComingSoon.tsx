export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="max-w-xl mx-auto py-24 px-4 text-center">
      <p className="text-xs uppercase tracking-wide text-amber-400 mb-3">Módulo en desarrollo</p>
      <h1 className="text-2xl font-semibold text-neutral-50 mb-3">{title}</h1>
      <p className="text-neutral-400">
        Esta sección todavía no tiene un flujo funcional propio. Está prevista en el roadmap de
        Flipp.AR y se irá habilitando en próximas fases.
      </p>
    </div>
  );
}
