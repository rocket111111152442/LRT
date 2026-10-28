import { useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Asterisk,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Clapperboard,
  Film,
  Gauge,
  Info,
  Link2,
  MapPin,
  Megaphone,
  Package,
  PenLine,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  Tags,
  Users,
  WandSparkles,
} from "lucide-react";
import { Action, Reveal } from "./experience";
import {
  contactHref,
  digitalServices,
  expertiseLinks,
  launchPriceNote,
  packs,
  photoPriceFactors,
  photoRates,
  seoFocus,
  seoRates,
  socialExclusions,
  socialPlans,
  socialRates,
  videoFormats,
  videoRates,
  type Offer,
  type Pack,
  type Rate,
} from "./content";

// Pages ajoutées le 20/10/2026 : réseaux sociaux, photographie, vidéo, référencement SEO
// et packs. Mêmes composants visuels que le reste du site (price-card, values-grid,
// service-row, contact-band) ; seuls la liste de tarifs et le menu « Expertises » sont nouveaux.

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

// ---------- Navigation ----------

export function ExpertiseMenu({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!group.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const current = expertiseLinks.some((l) => l.href === path);
  return (
    <div
      ref={group}
      className="nav-group"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="nav-group-trigger"
        aria-expanded={open}
        aria-controls="nav-expertises"
        data-current={current || undefined}
        onClick={() => setOpen((value) => !value)}
      >
        Expertises
        <ChevronDown size={14} />
        <span />
      </button>
      <div id="nav-expertises" className="nav-group-panel">
        <span className="nav-group-title">NOS EXPERTISES</span>
        {expertiseLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            aria-current={path === l.href ? "page" : undefined}
            className={l.href === "/packs" ? "nav-group-packs" : undefined}
          >
            <strong>{l.label}</strong>
            <small>{l.tag}</small>
            <em>{l.from}</em>
          </a>
        ))}
      </div>
    </div>
  );
}

export function MobileExpertises() {
  return (
    <div
      className="menu-expertises"
      role="navigation"
      aria-label="Nos expertises"
    >
      <span>NOS EXPERTISES</span>
      <div>
        {expertiseLinks.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function FooterExpertises() {
  return (
    <nav className="footer-expertises" aria-label="Nos expertises">
      <span>EXPERTISES</span>
      {expertiseLinks.map((l) => (
        <a key={l.href} href={l.href}>
          {l.label}
        </a>
      ))}
    </nav>
  );
}

// ---------- Blocs communs ----------

function PageIntro({
  label,
  title,
  em,
  text,
  cta,
}: {
  label: string;
  title: string;
  em: string;
  text: string;
  cta: { href: string; label: string };
}) {
  return (
    <section className="page-heading wrap service-heading">
      <Label number="EXPERTISE">{label}</Label>
      <h1>
        {title}
        <br />
        <em>{em}</em>
      </h1>
      <p>{text}</p>
      <div className="service-heading-actions">
        <Action href={cta.href}>{cta.label}</Action>
        <span className="launch-tag">
          <i />
          Tarifs de lancement, devis gratuit
        </span>
      </div>
    </section>
  );
}

function Price({ value }: { value: string }) {
  const match = value.match(/^(Dès )?(.+?€)(.*)$/);
  if (!match) return <strong className="rate-price">{value}</strong>;
  return (
    <strong className="rate-price">
      {match[1] && <small>DÈS</small>}
      {match[2]}
      {match[3] && <span>{match[3]}</span>}
    </strong>
  );
}

function RateList({
  service,
  rates,
  cta = "Demander un devis",
}: {
  service: string;
  rates: Rate[];
  cta?: string;
}) {
  return (
    <div className="rate-list">
      {rates.map((r, i) => (
        <Reveal
          key={r.name}
          delay={(i % 4) * 0.05}
          className={r.detail ? "rate-row rate-row-detailed" : "rate-row"}
        >
          <span className="rate-index">{String(i + 1).padStart(2, "0")}</span>
          <div className="rate-name">
            <h3>{r.name}</h3>
            {r.detail && <p>{r.detail}</p>}
          </div>
          <Price value={r.price} />
          <a
            className="rate-cta"
            href={contactHref(service, r.name)}
            aria-label={`${cta} : ${r.name}, ${r.price}`}
          >
            {cta}
            <ArrowUpRight size={15} />
          </a>
        </Reveal>
      ))}
    </div>
  );
}

function PlanCards({ items }: { items: (Offer | Pack)[] }) {
  return (
    <div className="price-grid plan-grid">
      {items.map((o, i) => (
        <Reveal
          key={o.name}
          delay={i * 0.08}
          className={`price-card ${o.featured ? "price-featured" : ""}`}
        >
          <span className="price-label">{o.label}</span>
          <h3>{"benefits" in o ? `Pack ${o.name}` : o.name}</h3>
          <p>{o.text}</p>
          <div className="price-value">
            <small>{o.kicker}</small>
            <strong>{o.price}</strong>
            <span>{o.suffix}</span>
          </div>
          <span className="price-maintenance">{o.note}</span>
          <Action href={o.href} light={o.featured}>
            {o.cta}
          </Action>
          {"benefits" in o && <span className="plan-list-title">COMPREND</span>}
          <ul>
            {o.features.map((f) => (
              <li key={f}>
                <Check size={16} />
                {f}
              </li>
            ))}
          </ul>
          {"benefits" in o && (
            <>
              <span className="plan-list-title">LES AVANTAGES</span>
              <ul className="plan-benefits">
                {o.benefits.map((b) => (
                  <li key={b}>
                    <ArrowUpRight size={16} />
                    {b}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Reveal>
      ))}
    </div>
  );
}

function LaunchNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="price-note launch-note">
      <span>
        <Info size={14} />
        {launchPriceNote}
      </span>
      {children}
    </p>
  );
}

function Highlights({
  items,
  icons,
}: {
  items: { title: string; text: string }[];
  icons: typeof Camera[];
}) {
  return (
    <div className="values-grid">
      {items.map((item, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Reveal key={item.title} delay={(i % 3) * 0.1}>
            <Icon size={30} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Reveal>
        );
      })}
    </div>
  );
}

// Liens vers les autres expertises (maillage interne entre les pages de services).
function OtherExpertises({ current }: { current: string }) {
  return (
    <section className="section wrap services-preview">
      <div className="section-heading">
        <div>
          <Label number="AUSSI">LES AUTRES EXPERTISES DE LULLIN WEB</Label>
          <h2>
            Toute votre communication,
            <br />
            <em>au même endroit.</em>
          </h2>
        </div>
        <p>
          Site internet, réseaux sociaux, photos, vidéos et référencement :
          chaque service se commande seul ou en pack.
        </p>
      </div>
      <div className="service-rows">
        {expertiseLinks
          .filter((l) => l.href !== current)
          .map((l, i) => (
            <Reveal key={l.href}>
              <a href={l.href} className="service-row">
                <span className="service-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{l.label}</h3>
                <span className="service-row-tag">{l.from}</span>
                <ArrowUpRight size={27} />
              </a>
            </Reveal>
          ))}
      </div>
    </section>
  );
}

function ServiceBand({
  label,
  title,
  accent,
  text,
  cta,
  href,
}: {
  label: string;
  title: string;
  accent: string;
  text: string;
  cta: string;
  href: string;
}) {
  return (
    <section className="contact-band">
      <div className="wrap">
        <Reveal>
          <Label number="UN PROJET ?">{label}</Label>
          <h2>
            {title}
            <br />
            <span>{accent}</span>
          </h2>
        </Reveal>
        <div className="contact-band-bottom">
          <p>{text}</p>
          <Action href={href}>{cta}</Action>
          <span className="availability">
            <i />
            Devis gratuit et sans engagement
          </span>
        </div>
      </div>
      <span className="contact-star" aria-hidden="true">
        <Asterisk />
      </span>
    </section>
  );
}

// Bloc « Au-delà du site » repris sur l'accueil et la page Expertises.
export function DigitalServicesSection() {
  return (
    <section className="section wrap services-preview digital-preview">
      <div className="section-heading">
        <div>
          <Label number="COMMUNICATION">AU-DELÀ DU SITE INTERNET</Label>
          <h2>
            Réseaux sociaux, photo,
            <br />
            <em>vidéo et référencement.</em>
          </h2>
        </div>
        <p>
          Votre site est la base. Nous pouvons aussi préparer vos publications,
          vos photos, vos vidéos et votre visibilité sur Google.
        </p>
      </div>
      <div className="service-rows">
        {digitalServices.map((s, i) => (
          <Reveal key={s.href}>
            <a href={s.href} className="service-row">
              <span className="service-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{s.title}</h3>
              <span className="service-row-tag">
                {s.tag}
                <b>{s.from}</b>
              </span>
              <ArrowUpRight size={27} />
            </a>
          </Reveal>
        ))}
      </div>
      <a className="text-link" href="/packs">
        Découvrir nos packs de communication <ArrowUpRight size={17} />
      </a>
    </section>
  );
}

// ---------- Réseaux sociaux ----------

export function SocialMedia() {
  return (
    <>
      <PageIntro
        label="GESTION DES RÉSEAUX SOCIAUX"
        title="Gestion des réseaux sociaux"
        em="pour votre entreprise."
        text="Création de visuels, rédaction des légendes, programmation et calendrier éditorial : Lullin Web prépare chaque mois les publications de votre entreprise. Abonnements dès 79 € par mois, pour les entreprises de Six-Fours-les-Plages, Toulon, Sanary-sur-Mer et du Var, ou à distance partout en France."
        cta={{ href: contactHref("Réseaux sociaux"), label: "Demander un devis" }}
      />
      <section className="section wrap home-statement">
        <Label number="01">CE QUE NOUS PRENONS EN CHARGE</Label>
        <Reveal>
          <h2>
            Des publications
            <br />
            <span>régulières,</span>
            <br />
            à votre image.
          </h2>
        </Reveal>
        <div className="statement-copy">
          <ArrowDownRight size={48} />
          <p>
            Chaque mois, nous préparons les visuels et les légendes de vos
            publications à partir de votre activité, de vos offres et de vos
            actualités.
          </p>
          <p>
            Selon votre abonnement, nous programmons aussi leur diffusion,
            organisons un calendrier éditorial, réalisons des stories simples et
            vous adressons un bilan mensuel.
          </p>
          <a className="text-link" href="#abonnements">
            Voir les abonnements <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="section wrap service-pricing" id="abonnements">
        <div className="section-heading">
          <div>
            <Label number="02">ABONNEMENTS MENSUELS</Label>
            <h2>
              Trois rythmes,
              <br />
              <em>des prix clairs.</em>
            </h2>
          </div>
          <p>
            Quatre, huit ou douze publications par mois : choisissez le rythme
            qui convient à votre entreprise.
          </p>
        </div>
        <PlanCards items={socialPlans} />
        <div className="scope-note">
          <Info size={18} />
          <p>
            <strong>Non inclus dans les abonnements, sauf devis spécifique :</strong>{" "}
            {socialExclusions.join(", ").toLowerCase()}.
          </p>
        </div>
        <LaunchNote />
      </section>
      <section className="section wrap service-pricing" id="a-l-unite">
        <div className="section-heading">
          <div>
            <Label number="03">PRESTATIONS À L’UNITÉ</Label>
            <h2>
              Un besoin ponctuel{"\u00a0"}?
              <br />
              <em>À la carte.</em>
            </h2>
          </div>
          <p>
            Une publication, un carrousel, un Reel ou un profil à remettre au
            propre : commandez uniquement ce dont vous avez besoin.
          </p>
        </div>
        <RateList service="Réseaux sociaux" rates={socialRates} />
        <LaunchNote>
          <a href="/video">
            Besoin d’une vidéo ? <ArrowUpRight size={13} />
          </a>
        </LaunchNote>
      </section>
      <OtherExpertises current="/reseaux-sociaux" />
      <ServiceBand
        label="VOS RÉSEAUX SOCIAUX"
        title="Publiez régulièrement,"
        accent="sans tout faire seul."
        text="Présentez-nous votre activité et vos réseaux : nous vous proposons l’abonnement ou les prestations adaptés."
        cta="Demander un devis"
        href={contactHref("Réseaux sociaux")}
      />
    </>
  );
}

// ---------- Photographie ----------

export function Photography() {
  return (
    <>
      <PageIntro
        label="PHOTOGRAPHIE PROFESSIONNELLE"
        title="Photographie professionnelle"
        em="pour les entreprises."
        text="Des photos professionnelles de vos produits, de vos locaux, de votre équipe ou de vos événements, pour votre site, vos réseaux sociaux et vos supports. Les séances sont réalisées avec des photographes partenaires, à Six-Fours-les-Plages, Toulon, Sanary-sur-Mer et dans le Var."
        cta={{ href: contactHref("Photographie"), label: "Demander une séance photo" }}
      />
      <div className="assurance-band wrap partner-band">
        <Camera />
        <p>
          Des photographes partenaires.
          <span>
            Lullin Web organise votre séance avec un photographe partenaire.
            Ses disponibilités et le tarif définitif vous sont confirmés avant
            toute réservation.
          </span>
        </p>
        <a href={contactHref("Photographie")}>
          Demander une séance photo <ArrowUpRight size={16} />
        </a>
      </div>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="01">CE QUE NOUS PHOTOGRAPHIONS</Label>
            <h2>
              Des images vraies
              <br />
              <em>de votre entreprise.</em>
            </h2>
          </div>
          <p>
            Vos clients voient votre travail, vos lieux et les personnes qui
            les accueillent, pas une banque d’images.
          </p>
        </div>
        <Highlights
          icons={[Package, Building2, Users, CalendarDays, Camera]}
          items={[
            { title: "Vos produits.", text: "Des photos nettes et homogènes pour votre boutique en ligne, votre site ou vos réseaux sociaux." },
            { title: "Vos biens immobiliers.", text: "Des pièces lumineuses et des volumes lisibles pour vos annonces de vente ou de location." },
            { title: "Votre équipe.", text: "Des portraits et des photos de groupe pour présenter les personnes derrière votre entreprise." },
            { title: "Vos événements.", text: "Un reportage pour garder une trace de vos inaugurations, salons, soirées ou ateliers." },
            { title: "Votre activité.", text: "Une séance ou un reportage dans vos locaux, sur vos chantiers ou auprès de vos clients." },
          ]}
        />
      </section>
      <section className="section wrap service-pricing" id="tarifs">
        <div className="section-heading">
          <div>
            <Label number="02">TARIFS</Label>
            <h2>
              Séances et reportages,
              <br />
              <em>à partir de 99 €.</em>
            </h2>
          </div>
          <p>
            Indiquez la prestation qui vous intéresse : nous revenons vers vous
            avec un devis confirmé par le photographe.
          </p>
        </div>
        <RateList service="Photographie" rates={photoRates} />
        <div className="scope-note">
          <Info size={18} />
          <p>
            <strong>Le tarif définitif dépend :</strong>{" "}
            {photoPriceFactors.join(", ").toLowerCase()}. Il vous est
            communiqué dans le devis, avant toute réservation.
          </p>
        </div>
        <LaunchNote />
      </section>
      <section className="wrap before-start">
        <Label number="ZONE">OÙ ONT LIEU LES SÉANCES</Label>
        <h2>
          Près de chez vous,
          <br />
          <em>dans le Var.</em>
        </h2>
        <div>
          {[
            "Six-Fours-les-Plages et Sanary-sur-Mer",
            "Toulon et son agglomération",
            "Le reste du Var : précisez le lieu dans votre demande",
          ].map((t, i) => (
            <span key={t}>
              <small>0{i + 1}</small>
              {t}
            </span>
          ))}
        </div>
      </section>
      <OtherExpertises current="/photographie" />
      <ServiceBand
        label="VOTRE SÉANCE PHOTO"
        title="Des photos qui"
        accent="vous ressemblent."
        text="Dites-nous ce que vous souhaitez photographier, où et pour quel usage : nous organisons la séance avec un photographe partenaire."
        cta="Demander une séance photo"
        href={contactHref("Photographie")}
      />
    </>
  );
}

// ---------- Vidéo ----------

export function VideoPage() {
  return (
    <>
      <PageIntro
        label="CRÉATION DE VIDÉOS"
        title="Création de vidéos"
        em="du Reel au tournage."
        text="Vidéos publicitaires, Reels et Shorts, présentation d’entreprise, montage et création assistée par IA : des vidéos professionnelles pour votre site et vos réseaux sociaux. Montage dès 39 €, tournage à Six-Fours-les-Plages, Toulon, Sanary-sur-Mer et dans le Var."
        cta={{ href: contactHref("Vidéo"), label: "Demander une vidéo" }}
      />
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="01">CE QUE NOUS RÉALISONS</Label>
            <h2>
              Six formats,
              <br />
              <em>un même soin.</em>
            </h2>
          </div>
          <p>
            À partir de vos vidéos ou d’un tournage sur place, chaque format est
            monté pour l’endroit où il sera vu.
          </p>
        </div>
        <Highlights
          items={videoFormats}
          icons={[Megaphone, Smartphone, Building2, Scissors, Film, WandSparkles]}
        />
      </section>
      <section className="section wrap service-pricing" id="tarifs">
        <div className="section-heading">
          <div>
            <Label number="02">TARIFS</Label>
            <h2>
              Du montage simple
              <br />
              <em>au tournage.</em>
            </h2>
          </div>
          <p>
            Les prix « dès » sont ajustés selon votre projet : le montant exact
            est précisé dans votre devis, avant de commencer.
          </p>
        </div>
        <RateList service="Vidéo" rates={videoRates} />
        <LaunchNote>
          <a href="/reseaux-sociaux">
            Publier vos vidéos sur vos réseaux <ArrowUpRight size={13} />
          </a>
        </LaunchNote>
      </section>
      <div className="assurance-band wrap">
        <Clapperboard />
        <p>
          Vous avez déjà des vidéos ?
          <span>
            Montage simple, Reel promotionnel et Reels pour les réseaux sociaux
            peuvent être réalisés à partir des vidéos que vous nous fournissez.
          </span>
        </p>
        <a href={contactHref("Vidéo", "Reel promotionnel avec vidéos fournies")}>
          Envoyer ma demande <ArrowUpRight size={16} />
        </a>
      </div>
      <OtherExpertises current="/video" />
      <ServiceBand
        label="VOTRE VIDÉO"
        title="Une vidéo pour"
        accent="vous faire remarquer."
        text="Décrivez votre idée, la durée souhaitée et l’endroit où la vidéo sera diffusée : nous vous proposons le format adapté."
        cta="Demander une vidéo"
        href={contactHref("Vidéo")}
      />
    </>
  );
}

// ---------- Référencement SEO ----------

export function SeoPage() {
  return (
    <>
      <PageIntro
        label="RÉFÉRENCEMENT NATUREL ET VISIBILITÉ LOCALE"
        title="Référencement SEO"
        em="et visibilité locale."
        text="Audit, optimisation des pages, rédaction d’articles, fiche Google Business et suivi mensuel : nous améliorons ce qui aide Google à comprendre et à présenter votre entreprise, à Six-Fours-les-Plages, Toulon, Sanary-sur-Mer, dans le Var ou partout en France."
        cta={{
          href: contactHref("Référencement SEO"),
          label: "Améliorer mon référencement",
        }}
      />
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="01">CE SUR QUOI NOUS TRAVAILLONS</Label>
            <h2>
              Six leviers
              <br />
              <em>pour être trouvé.</em>
            </h2>
          </div>
          <p>
            Le référencement naturel se construit page après page : contenus,
            technique, informations locales et liens entre vos pages.
          </p>
        </div>
        <Highlights
          items={seoFocus}
          icons={[Search, MapPin, Gauge, PenLine, Tags, Link2]}
        />
      </section>
      <div className="assurance-band wrap">
        <ShieldCheck />
        <p>
          Aucune promesse intenable.
          <span>
            Personne ne peut garantir la première position sur Google ni un
            nombre de visiteurs. Nous travaillons sur les leviers qui favorisent
            votre visibilité, sans promesse de résultat chiffré.
          </span>
        </p>
        <a href="/faq">
          Nos réponses <ArrowUpRight size={16} />
        </a>
      </div>
      <section className="section wrap service-pricing" id="tarifs">
        <div className="section-heading">
          <div>
            <Label number="02">PRESTATIONS ET TARIFS</Label>
            <h2>
              Ce que comprend
              <br />
              <em>chaque prestation.</em>
            </h2>
          </div>
          <p>
            Commencez par un audit, optimisez les pages qui comptent, puis
            faites progresser votre site mois après mois.
          </p>
        </div>
        <RateList service="Référencement SEO" rates={seoRates} />
        <div className="scope-note">
          <Info size={18} />
          <p>
            <strong>Votre site est maintenu par Lullin Web ?</strong>{" "}
            L’abonnement Maintenance Visibilité (119 € / mois) comprend déjà un
            travail mensuel sur le référencement naturel. Lors de la création de
            votre site, la création ou l’optimisation Google Business est
            proposée en option à 79 €.{" "}
            <a href="/offres#maintenance">Voir les abonnements</a>
          </p>
        </div>
        <LaunchNote />
      </section>
      <OtherExpertises current="/referencement-seo" />
      <ServiceBand
        label="VOTRE RÉFÉRENCEMENT"
        title="Être trouvé,"
        accent="près de chez vous."
        text="Indiquez l’adresse de votre site, votre activité et votre secteur : nous vous proposons les actions prioritaires."
        cta="Améliorer mon référencement"
        href={contactHref("Référencement SEO")}
      />
    </>
  );
}

// ---------- Packs ----------

export function PacksPage() {
  return (
    <>
      <PageIntro
        label="PACKS DE COMMUNICATION DIGITALE"
        title="Packs de communication digitale"
        em="à prix unique."
        text="Votre site internet, des photos professionnelles, une vidéo et vos premières publications, réunis dans une seule prestation : trois packs de 449 € à 1 490 € pour lancer ou développer la communication de votre entreprise."
        cta={{
          href: contactHref("Packs de communication"),
          label: "Demander un devis",
        }}
      />
      <section className="section wrap service-pricing" id="packs">
        <div className="section-heading">
          <div>
            <Label number="01">NOS PACKS</Label>
            <h2>
              Trois packs,
              <br />
              <em>trois étapes.</em>
            </h2>
          </div>
          <p>
            Démarrer, soigner votre image ou développer votre communication :
            chaque pack réunit les prestations utiles à cette étape.
          </p>
        </div>
        <PlanCards items={packs} />
        <div className="scope-note">
          <Info size={18} />
          <p>
            <strong>Des prestations ponctuelles, à prix unique.</strong> Les
            abonnements mensuels sont proposés séparément :{" "}
            <a href="/reseaux-sociaux#abonnements">réseaux sociaux</a> et{" "}
            <a href="/offres#maintenance">maintenance du site</a>. Les séances
            photo sont réalisées par des photographes partenaires et confirmées
            selon leurs disponibilités.
          </p>
        </div>
        <LaunchNote />
      </section>
      <section className="wrap before-start">
        <Label number="COMMENT CHOISIR ?">LE BON PACK EN 10 SECONDES</Label>
        <h2>
          Vous voulez surtout…
          <br />
          <em>on vous dit lequel.</em>
        </h2>
        <div>
          {[
            "Démarrer votre présence en ligne → Présence",
            "Améliorer votre image professionnelle → Image Pro",
            "Développer votre communication numérique → Visibilité 360",
          ].map((t, i) => (
            <span key={t}>
              <small>0{i + 1}</small>
              {t}
            </span>
          ))}
        </div>
      </section>
      <OtherExpertises current="/packs" />
      <ServiceBand
        label="VOTRE PACK"
        title="Toute votre communication,"
        accent="en un seul projet."
        text="Présentez-nous votre entreprise et vos objectifs : nous vous confirmons le pack adapté et son contenu dans un devis gratuit."
        cta="Demander un devis"
        href={contactHref("Packs de communication")}
      />
    </>
  );
}
