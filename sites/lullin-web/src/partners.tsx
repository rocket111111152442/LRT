import { Accordion } from "@base-ui/react/accordion";
import {
  ArrowDownRight,
  Asterisk,
  ArrowUpRight,
  Handshake,
  ListChecks,
  Mail,
  Minus,
  Percent,
  Plus,
  Scale,
  Users,
} from "lucide-react";
import { Action, Reveal } from "./experience";
import {
  partnerBenefits,
  partnerFaqs,
  partnerProfiles,
  partnerServices,
  partnerSteps,
} from "./content";
import { legal } from "./legal";

// Le seul point de contact de cette page est l'e-mail, avec un objet prérempli.
export const partnerMail = `mailto:${legal.email}?subject=${encodeURIComponent("Devenir partenaire de Lullin Web")}`;

function Label({
  children,
  number = "01",
}: {
  children: React.ReactNode;
  number?: string;
}) {
  return (
    <p className="section-label">
      <span>{number} /</span>
      {children}
    </p>
  );
}

export function Partners() {
  return (
    <>
      <section className="page-heading wrap">
        <Label number="PARTENARIAT">
          APPORTEURS D’AFFAIRES & PRESCRIPTEURS
        </Label>
        <h1>
          Vous accompagnez.
          <br />
          <em>Nous créons leur site.</em>
        </h1>
        <p>
          Aidez les entrepreneurs que vous accompagnez à avoir une présence en
          ligne professionnelle, tout en développant une nouvelle source de
          revenus. Commission de 10 % à 20 % sur chaque client apporté et
          signé, sans frais ni exclusivité, partout dans l’espace francophone.
        </p>
      </section>

      <section className="section wrap home-statement">
        <Label number="01">LE PARTENARIAT EN CLAIR</Label>
        <Reveal>
          <h2>
            Vous recommandez.
            <br />
            <span>Nous faisons le reste.</span>
            <br />
            Vous touchez une commission.
          </h2>
        </Reveal>
        <div className="statement-copy">
          <ArrowDownRight size={48} />
          <p>
            Beaucoup de professionnels accompagnent des créateurs d’entreprise
            qui ont besoin d’un site internet, sans vouloir gérer eux-mêmes ce
            type de projet. Ce partenariat de création de site internet répond
            exactement à cela : vous nous présentez la personne, nous prenons le
            projet en charge du premier échange à la mise en ligne.
          </p>
          <p>
            La commission d’apporteur d’affaires va de 10 % à 20 % du montant de
            la prestation. Le taux dépend de la taille des projets et du
            potentiel des clients que vous apportez ; il est convenu avec vous
            avant la première recommandation. Elle est versée après la signature
            du client et le règlement de la prestation.
          </p>
          <a className="text-link" href={partnerMail}>
            Poser une question par e-mail <ArrowUpRight size={17} />
          </a>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="POUR QUI ?">LES PROFESSIONNELS QUE NOUS CHERCHONS</Label>
            <h2>
              Vous accompagnez
              <br />
              <em>des entrepreneurs ?</em>
            </h2>
          </div>
          <p>
            Un partenariat pensé pour les incubateurs, les organismes de
            formation et tous ceux qui conseillent des porteurs de projets.
          </p>
        </div>
        <div className="filter-bar">
          <div>
            {partnerProfiles.map((p) => (
              <span key={p} className="filter">
                {p}
              </span>
            ))}
          </div>
        </div>
        <p className="price-note">
          Vous ne vous reconnaissez pas dans cette liste mais vous êtes en
          contact avec des entrepreneurs ? Écrivez-nous, nous en parlerons.{" "}
          <a href={partnerMail}>
            Nous écrire <ArrowUpRight size={13} />
          </a>
        </p>
      </section>

      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="02">CE QUE LE PARTENARIAT VOUS APPORTE</Label>
            <h2>
              Vos avantages,
              <br />
              <em>sans la charge.</em>
            </h2>
          </div>
          <p>
            Vous gardez votre métier. Nous prenons la partie technique,
            commerciale et le suivi du projet.
          </p>
        </div>
        <div className="values-grid">
          {partnerBenefits.map((b, i) => {
            const Icon = [Handshake, Percent, Users, ListChecks, Scale][i];
            return (
              <Reveal key={b.title} delay={(i % 3) * 0.1}>
                <Icon size={30} />
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      <div className="marquee" aria-label="Commission de 10 à 20 pour cent, sans frais">
        <div aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>
              COMMISSION{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>{" "}
              10 % À 20 %{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>{" "}
              SANS FRAIS{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>
            </span>
          ))}
        </div>
      </div>

      <section className="section wrap services-preview">
        <div className="section-heading">
          <div>
            <Label number="03">CE QUE REÇOIVENT VOS CLIENTS</Label>
            <h2>
              Des projets
              <br />
              <em>vraiment menés.</em>
            </h2>
          </div>
          <p>
            Du site d’une page à la boutique en ligne, avec des prix publics
            connus à l’avance.
          </p>
        </div>
        <div className="service-rows">
          {partnerServices.map((s) => (
            <Reveal key={s.number}>
              <a href="/offres" className="service-row">
                <span className="service-number">{s.number}</span>
                <h3>{s.title}</h3>
                <span className="service-row-tag">{s.tag}</span>
                <ArrowUpRight size={27} />
              </a>
            </Reveal>
          ))}
        </div>
        <a className="text-link" href="/offres">
          Voir les offres et les prix <ArrowUpRight size={17} />
        </a>
      </section>

      <section className="method-home section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <Label number="04">COMMENT ÇA MARCHE</Label>
              <h2>
                Trois étapes.
                <br />
                <em>Pas une de plus.</em>
              </h2>
            </div>
            <Action href={partnerMail} light>
              Devenir partenaire
            </Action>
          </div>
          <div className="steps-grid">
            {partnerSteps.map((s, i) => (
              <Reveal key={s.note} delay={i * 0.1}>
                <span className="step-n">
                  0{i + 1}
                  <ArrowUpRight size={22} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="assurance-band wrap">
        <Scale />
        <p>
          Un accord écrit si vous le souhaitez.
          <span>
            Convention d’apporteur d’affaires précisant le taux, le mode de
            calcul, les délais de versement et la durée.
          </span>
        </p>
        <a href={partnerMail}>
          Demander le modèle <ArrowUpRight size={16} />
        </a>
      </div>

      <section className="wrap before-start">
        <Label number="SANS ENGAGEMENT">UN CADRE SIMPLE ET TRANSPARENT</Label>
        <h2>
          Rien à avancer.
          <br />
          <em>Rien à promettre.</em>
        </h2>
        <div>
          {[
            "Aucun frais d’entrée ni abonnement",
            "Aucune exclusivité demandée",
            "Aucun volume minimum de clients",
          ].map((t, i) => (
            <span key={t}>
              <small>0{i + 1}</small>
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="05">LA CONFIANCE, CONCRÈTEMENT</Label>
            <h2>
              Vous recommandez
              <br />
              <em>en connaissance de cause.</em>
            </h2>
          </div>
          <p>
            Votre nom est engagé quand vous nous présentez quelqu’un. Voilà ce
            que nous mettons en face.
          </p>
        </div>
        <div className="values-grid">
          {[
            {
              icon: ListChecks,
              title: "Chaque recommandation est suivie.",
              text: "Enregistrée à votre nom dès réception, avec une confirmation écrite, puis un point à la signature et au paiement.",
            },
            {
              icon: Mail,
              title: "Une communication claire.",
              text: "Vous êtes informé de l’avancement de chaque projet que vous avez apporté, sans avoir à relancer.",
            },
            {
              icon: Handshake,
              title: "Des prix publics.",
              text: "Nos tarifs sont affichés sur le site, de 349 € à 949 €. La personne que vous recommandez sait à quoi s’attendre avant même de nous écrire.",
            },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <v.icon size={30} />
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section wrap home-faq">
        <div>
          <Label number="06">QUESTIONS DES PARTENAIRES</Label>
          <h2>
            Avant de
            <br />
            <em>nous recommander.</em>
          </h2>
          <a className="text-link" href={partnerMail}>
            Poser une autre question <ArrowUpRight size={17} />
          </a>
        </div>
        <Accordion.Root className="faq-list">
          {partnerFaqs.map((f, i) => (
            <Accordion.Item key={f.q} className="faq-item">
              <Accordion.Header>
                <Accordion.Trigger className="faq-trigger">
                  <span>
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    {f.q}
                  </span>
                  <Plus className="faq-plus" size={20} />
                  <Minus className="faq-minus" size={20} />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="faq-panel">
                <div>{f.a}</div>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <section className="contact-band">
        <div className="wrap">
          <Reveal>
            <Label number="LA SUITE">
              UN ÉCHANGE SUFFIT POUR COMMENCER
            </Label>
            <h2>
              Devenir partenaire
              <br />
              <span>de Lullin Web.</span>
            </h2>
          </Reveal>
          <div className="contact-band-bottom">
            <p>
              Présentez-vous en quelques lignes : votre activité, les personnes
              que vous accompagnez et la façon dont vous souhaitez travailler
              avec nous.
            </p>
            <Action href={partnerMail}>Écrire à Lullin Web</Action>
            <span className="availability">
              <i />
              {legal.email}
            </span>
          </div>
        </div>
        <span className="contact-star" aria-hidden="true">
          <Asterisk />
        </span>
      </section>
    </>
  );
}
