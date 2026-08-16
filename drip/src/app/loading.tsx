export default function Loading() {
  return (
    <div className="shell flex min-h-[60vh] items-center justify-center py-24">
      <div className="flex flex-col items-center gap-5">
        {/* La goutte tombe pendant le chargement : cohérent avec la marque et
            plus discret qu'un spinner générique. */}
        <span className="block h-12 w-px overflow-hidden bg-[color:var(--color-ash)]">
          <span className="block h-5 w-px animate-[loading-drop_1.4s_ease-in-out_infinite] bg-[color:var(--color-ink)]" />
        </span>

        <span className="label text-[color:var(--color-smoke)]">Chargement</span>
      </div>

      <style>{`
        @keyframes loading-drop {
          0% { transform: translateY(-100%); }
          70%, 100% { transform: translateY(240%); }
        }
      `}</style>
    </div>
  );
}
