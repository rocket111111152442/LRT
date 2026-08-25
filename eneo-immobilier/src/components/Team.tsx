import { team } from "@/lib/data";
import Reveal from "./Reveal";

const palettes = [
  "from-forest to-ink",
  "from-ink to-forest",
  "from-stone to-ink",
  "from-forest to-stone",
];

export default function Team() {
  return (
    <section id="equipe" className="bg-ivory px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <p className="text-[11px] uppercase tracking-widest2 text-stone">
            L&rsquo;équipe
          </p>
          <h2 className="mt-4 max-w-xl font-display text-4xl italic leading-tight text-ink md:text-5xl">
            Une équipe à taille humaine, engagée à vos côtés.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <Reveal key={member.id} delay={i * 0.08}>
              <div
                className={`flex aspect-[3/4] items-end bg-gradient-to-br p-6 ${palettes[i % palettes.length]}`}
              >
                <span className="font-display text-6xl italic text-ivory/90">
                  {member.initials}
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl italic text-ink">
                {member.name}
              </h3>
              <p className="mt-1 text-[13px] uppercase tracking-widest2 text-stone">
                {member.role}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
