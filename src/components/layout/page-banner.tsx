export function PageBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="bg-navy-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <h1 className="text-3xl font-extrabold tracking-wide sm:text-4xl">{title.toUpperCase()}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">{subtitle}</p>
      </div>
    </section>
  );
}
