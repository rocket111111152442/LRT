import { company } from "@/lib/data";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="bg-forest px-6 py-24 text-ivory md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-10">
          <Reveal>
            <p className="text-[11px] uppercase tracking-widest2 text-ivory/50">
              Contact
            </p>
            <h2 className="mt-4 max-w-lg font-display text-4xl italic leading-tight md:text-6xl">
              Parlons de votre patrimoine immobilier.
            </h2>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={`tel:${company.phoneHref}`}
                className="inline-flex items-center gap-3 rounded-full bg-ivory px-7 py-3.5 text-[13px] uppercase tracking-widest2 text-ink transition-opacity duration-300 hover:opacity-85"
              >
                Appeler
              </a>
              <a
                href={`mailto:${company.email}`}
                className="inline-flex items-center gap-3 rounded-full border border-ivory/40 px-7 py-3.5 text-[13px] uppercase tracking-widest2 text-ivory transition-colors duration-300 hover:border-ivory"
              >
                Envoyer un email
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="border-t border-ivory/15 pt-8 md:ml-auto md:max-w-sm">
              <p className="font-display text-2xl italic">{company.name}</p>
              <div className="mt-6 space-y-2 text-[15px] font-light text-ivory/75">
                <p>{company.address}</p>
                <p>{company.city}</p>
              </div>
              <div className="mt-6 space-y-2 text-[15px] font-light">
                <p>
                  <a href={`tel:${company.phoneHref}`} className="hover:text-ivory/80">
                    {company.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${company.email}`} className="hover:text-ivory/80">
                    {company.email}
                  </a>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
