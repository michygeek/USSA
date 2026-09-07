import { Icon } from '@/components/ui/icon';

const TESTIMONIALS = [
  {
    quote:
      'The instructor-led corrections training gave my team the confidence and skills to handle high-pressure situations. The certification is respected across the state.',
    name: 'J. Alvarez',
    role: 'Corrections Shift Supervisor',
  },
  {
    quote:
      'USSA’s law enforcement use-of-force course was thorough, current, and directly applicable in the field. Highly recommended for any agency.',
    name: 'M. Chen',
    role: 'Police Sergeant',
  },
  {
    quote:
      'Web-based training let me complete my security officer certification around a full-time work schedule without sacrificing quality.',
    name: 'D. Thompson',
    role: 'Certified Security Officer',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-2xl font-extrabold tracking-wide text-navy-900">WHAT OUR GRADUATES SAY</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.name} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <Icon name="quote" className="h-6 w-6 text-gold-500" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{testimonial.quote}</p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-navy-900">{testimonial.name}</p>
                <p className="text-xs text-slate-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
