import { Phone, ShieldCheck } from 'lucide-react';

import BoutonMagnetique from '@/components/BoutonMagnetique';
import FormulaireContact from '@/components/FormulaireContact';
import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import { agence, horaires } from '@/content/site';
import { lienTel } from '@/lib/utils';

type Props = {
  /** Adapte l'accroche au contexte de la page qui l'appelle. */
  titre?: readonly string[];
  chapeau?: string;
  /** Version courte : rappel et boutons, sans formulaire. */
  variante?: 'formulaire' | 'rappel';
};

/**
 * Bloc de conversion réutilisé en bas de page.
 * En variante « rappel », il renvoie vers la page de contact plutôt que de
 * dupliquer le formulaire — un seul formulaire par page reste plus lisible.
 */
export default function SectionContact({
  titre = ['Parlons de votre situation,', 'sans engagement'],
  chapeau = "Nous évaluons gratuitement votre demande et vous disons franchement ce qui peut être établi, dans quel délai et à quel coût. Aucun dossier n'est ouvert avant votre accord écrit.",
  variante = 'formulaire',
}: Props) {
  return (
    <section className="section relative overflow-hidden border-t border-[var(--trait)] bg-graphite">
      <div aria-hidden="true" className="grille-fond opacity-50" />

      <div className="cadre relative z-2">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="etiquette">Premier contact</p>
            <TitreMasque as="h2" lignes={titre} className="mt-6 font-display text-t2 text-ivoire" />
            <Reveal retard={180}>
              <p className="mt-6 max-w-md text-conduite text-argent">{chapeau}</p>
            </Reveal>

            <Reveal retard={280}>
              <ul className="mt-9 flex flex-col gap-4">
                {[
                  'Analyse gratuite et sans engagement',
                  'Devis écrit avant toute intervention',
                  'Échanges strictement confidentiels',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <ShieldCheck
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-champagne"
                    />
                    <span className="text-[0.9375rem] text-argent">{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal retard={360}>
              <div className="mt-9 border-t border-[var(--trait)] pt-7">
                <a
                  href={lienTel(agence.telephonePrincipal)}
                  className="group inline-flex items-center gap-3 font-display text-t3 text-ivoire transition-colors duration-300 hover:text-champagne"
                >
                  <Phone aria-hidden="true" className="size-5 text-champagne" />
                  {agence.telephonePrincipalAffiche}
                </a>
                <p className="mt-3 text-[0.875rem] text-brume">
                  {horaires.accueil}. Interventions {horaires.terrain.toLowerCase()}.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal retard={160}>
            {variante === 'formulaire' ? (
              <div className="carte p-7 lg:p-10">
                <FormulaireContact />
              </div>
            ) : (
              <div className="carte flex h-full flex-col justify-center p-8 lg:p-12">
                <h3 className="font-display text-t3 text-ivoire">
                  Un formulaire complet vous attend sur la page de contact
                </h3>
                <p className="mt-4 text-argent">
                  Il vous permet de préciser la nature de votre demande, le secteur concerné et vos
                  disponibilités, afin que nous préparions le premier entretien.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <BoutonMagnetique href="/contact/" className="btn-primaire">
                    Évaluer ma situation
                  </BoutonMagnetique>
                  <a href={lienTel(agence.telephonePrincipal)} className="btn btn-secondaire">
                    <Phone aria-hidden="true" className="size-4" />
                    Appeler en toute confidentialité
                  </a>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
