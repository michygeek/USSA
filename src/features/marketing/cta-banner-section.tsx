import Link from 'next/link';

export function CtaBannerSection() {
  return (
    <section className="bg-gold-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-950">READY TO ADVANCE YOUR CAREER?</h2>
          <p className="mt-1 text-sm text-navy-900">
            Enroll today and start training with United States Security Academy.
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-navy-950 px-8 py-4 text-sm font-bold tracking-wide text-white hover:bg-navy-900"
        >
          ENROLL NOW <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
