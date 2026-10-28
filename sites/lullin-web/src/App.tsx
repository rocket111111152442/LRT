import { useEffect, useRef, useState, type FormEvent } from "react";
import { Accordion } from "@base-ui/react/accordion";
import { Dialog } from "@base-ui/react/dialog";
import {
  Asterisk,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Ban,
  Check,
  CheckCheck,
  ChevronLeft,
  Code2,
  Copy,
  Globe2,
  Hourglass,
  Layers,
  Menu,
  Minus,
  PhoneOff,
  Plus,
  Receipt,
  Send,
  ShieldCheck,
  Sparkles,
  Turtle,
  UserRound,
  X,
} from "lucide-react";
import {
  Action,
  Experience,
  HeroVideo,
  Reveal,
  useMotionEnabled,
} from "./experience";
import {
  audiences,
  budgets,
  existingSiteAnswers,
  faqs,
  maintenanceChoices,
  maintenancePlans,
  offers,
  options,
  projectTypes,
  projects,
  serviceCatalog,
  services,
  spared,
  steps,
  undecidedRate,
  type Offer,
} from "./content";
import seo from "./seo.json";
import { CGV, MentionsLegales, Privacy, legal } from "./legal";
import { Partners } from "./partners";
import {
  DigitalServicesSection,
  ExpertiseMenu,
  FooterExpertises,
  MobileExpertises,
  PacksPage,
  Photography,
  SeoPage,
  SocialMedia,
  VideoPage,
} from "./communication";

const path =
  window.location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
const navigation = [
  { label: "Expertises", href: "/services" },
  { label: "Réalisations", href: "/realisations" },
  { label: "L’agence", href: "/a-propos" },
  { label: "Offres", href: "/offres" },
];
function Wordmark({ large = false }: { large?: boolean }) {
  return (
    <span className="brand-lockup">
      <img
        className="brand-emblem"
        src="/images/lullin-mark.svg"
        alt=""
        width="40"
        height="40"
      />
      <span className={large ? "wordmark wordmark-large" : "wordmark"}>
        lullin<span>web</span>
      </span>
    </span>
  );
}
function Header() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(scrollY > 20);
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <a className="home-link" href="/" aria-label="Lullin Web, accueil">
        <Wordmark />
      </a>
      <nav className="desktop-nav" aria-label="Navigation principale">
        {navigation.map((n) =>
          // "Expertises" opens the list of every service, website creation included.
          n.href === "/services" ? (
            <ExpertiseMenu key={n.href} path={path} />
          ) : (
            <a
              key={n.href}
              href={n.href}
              aria-current={path === n.href ? "page" : undefined}
            >
              {n.label}
              <span />
            </a>
          ),
        )}
      </nav>
      <a className="header-contact" href="/contact">
        Parlons de votre projet <ArrowUpRight size={17} />
      </a>
      <Dialog.Root open={menu} onOpenChange={setMenu}>
        <Dialog.Trigger className="menu-trigger" aria-label="Ouvrir le menu">
          <Menu size={24} />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="menu-backdrop" />
          <Dialog.Popup className="mobile-menu">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Close className="menu-close" aria-label="Fermer le menu">
              <X />
            </Dialog.Close>
            <Wordmark />
            <nav aria-label="Navigation mobile">
              {[
                ...navigation,
                { label: "Notre méthode", href: "/methode" },
                { label: "Questions fréquentes", href: "/faq" },
                { label: "Devenir partenaire", href: "/partenaires" },
                { label: "Parlons de votre projet", href: "/contact" },
              ].map((n, i) => (
                <a key={n.href} href={n.href}>
                  <small>0{i + 1}</small>
                  {n.label}
                  <ArrowUpRight />
                </a>
              ))}
            </nav>
            <MobileExpertises />
            <a className="menu-email" href="mailto:contact@lullin-web.com">
              contact@lullin-web.com
            </a>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <a href="/" aria-label="Lullin Web, accueil">
          <Wordmark />
        </a>
        <p>
          Des idées claires.
          <br />
          Des sites qui comptent.
        </p>
        <div>
          <span>UN PROJET EN TÊTE ?</span>
          <a href="mailto:contact@lullin-web.com">
            contact@lullin-web.com <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <nav className="footer-nav" aria-label="Liens de bas de page">
        {[
          ...navigation,
          { label: "Méthode", href: "/methode" },
          { label: "FAQ", href: "/faq" },
          { label: "Partenaires", href: "/partenaires" },
          { label: "Contact", href: "/contact" },
        ].map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      <FooterExpertises />
      <div className="footer-signature" aria-hidden="true">
        lullin<span>web</span>
        <i>
          <ArrowUpRight />
        </i>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Lullin Web</span>
        <span>Design & développement sur mesure</span>
        <a href="/mentions-legales">Mentions légales</a>
        <a href="/cgv">CGV</a>
        <a href="/confidentialite">Confidentialité</a>
        <a href="#top" aria-label="Retour en haut">
          Tout en haut <ArrowUpRight size={14} />
        </a>
      </div>
    </footer>
  );
}
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
function Headline({
  label,
  title,
  em,
  description,
}: {
  label: string;
  title: string;
  em?: string;
  description?: string;
}) {
  return (
    <section className="page-heading wrap">
      <Label>{label}</Label>
      <h1>
        {title}
        {em && (
          <>
            <br />
            <em>{em}</em>
          </>
        )}
      </h1>
      {description && <p>{description}</p>}
    </section>
  );
}
function ContactBand() {
  return (
    <section className="contact-band">
      <div className="wrap">
        <Reveal>
          <Label number="UN PROJET ?">
            CRÉER UN SITE OU MODERNISER VOTRE PRÉSENCE EN LIGNE
          </Label>
          <h2>
            Un site à la hauteur
            <br />
            <span>de votre activité.</span>
          </h2>
        </Reveal>
        <div className="contact-band-bottom">
          <p>
            Présentez-nous votre projet et recevez
            <br />
            une proposition adaptée à vos besoins.
          </p>
          <Action href="/contact">Demander mon devis</Action>
          <span className="availability">
            <i />
            Sites internet à partir de 349 €
          </span>
        </div>
      </div>
      <span className="contact-star" aria-hidden="true">
        <Asterisk />
      </span>
    </section>
  );
}
function ProjectCard({
  project,
  index = 0,
  wide = false,
}: {
  project: (typeof projects)[number];
  index?: number;
  wide?: boolean;
}) {
  return (
    <Reveal
      delay={(index % 2) * 0.1}
      className={`project-card ${wide ? "project-wide" : ""}`}
    >
      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Découvrir ${project.name}, nouvel onglet`}
      >
        <div className={`project-visual ${project.className}`}>
          {project.image ? (
            <img
              src={project.image}
              alt={`Visuel de ${project.name}`}
              loading="lazy"
              width="1200"
              height="900"
            />
          ) : (
            <div className="project-typography">
              <span>{project.word}</span>
              <small>{project.descriptor}</small>
            </div>
          )}
          <span className="project-tag">{project.field}</span>
          <span className="project-open">
            <ArrowUpRight size={26} />
          </span>
          <span className="project-hover-label">
            Explorer le projet <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="project-caption">
          <div>
            <small>
              {String(index + 1).padStart(2, "0")} / {project.category}
            </small>
            <h3>{project.name}</h3>
          </div>
          <ArrowUpRight size={24} />
        </div>
      </a>
      <p className="project-summary">{project.summary}</p>
    </Reveal>
  );
}
function FAQList({ items = faqs.slice(0, 4) }: { items?: typeof faqs }) {
  return (
    <Accordion.Root className="faq-list">
      {items.map((f, i) => (
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
  );
}
function PriceCards({ items = offers }: { items?: Offer[] }) {
  return (
    <div
      className={`price-grid ${items.length === 4 ? "price-grid-4" : ""}`}
    >
      {items.map((o, i) => (
        <Reveal
          key={o.name}
          delay={i * 0.08}
          className={`price-card ${o.featured ? "price-featured" : ""}`}
        >
          <span className="price-label">{o.label}</span>
          <h3>{o.name}</h3>
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
          <ul>
            {o.features.map((f) => (
              <li key={f}>
                <Check size={16} />
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
function OptionsGrid() {
  return (
    <div className="values-grid options-grid">
      {options.map((o, i) => (
        <Reveal key={o.title} delay={(i % 2) * 0.1}>
          <strong>
            <small>{o.kicker}</small>
            {o.price}
          </strong>
          <h3>{o.title}</h3>
          <p>{o.text}</p>
        </Reveal>
      ))}
    </div>
  );
}
function Hero() {
  const enabled = useMotionEnabled();
  return (
    <section className="hero wrap">
      <div className="hero-heading">
        <p className="hero-eyebrow">
          <span className="status-dot" />
          CRÉATION DE SITES INTERNET SUR MESURE
          <span className="eyebrow-divider" />
          DESIGN & DÉVELOPPEMENT
        </p>
        <h1>
          <span>Votre site</span>
          <span>professionnel,</span>
          <span>
            <em>simplement.</em>
            <span className="headline-star" aria-hidden="true">
              <Asterisk />
            </span>
          </span>
        </h1>
        <div className="hero-under">
          <p>
            Un site moderne, rapide et adapté
            <br className="desktop-br" /> à votre activité, sans devoir investir
            <br className="desktop-br" /> plusieurs milliers d’euros.
          </p>
          <Action href="/contact">Demander un devis</Action>
        </div>
      </div>
      <div
        className="hero-orbital"
        aria-hidden="true"
        onPointerMove={(e) => {
          if (!enabled || e.pointerType === "touch") return;
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--orbit-x",
            `${(e.clientX - rect.left - rect.width / 2) * 0.05}px`,
          );
          e.currentTarget.style.setProperty(
            "--orbit-y",
            `${(e.clientY - rect.top - rect.height / 2) * 0.05}px`,
          );
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty("--orbit-x", "0px");
          e.currentTarget.style.setProperty("--orbit-y", "0px");
        }}
      >
        <HeroVideo />
        <span className="orbit-label orbit-label-top">
          <i />
          UNE AUTRE DIMENSION
        </span>
        <span className="orbit-label orbit-label-bottom">
          SUR MESURE, JUSQU’AU DÉTAIL <ArrowUpRight size={13} />
        </span>
        <div className="orbit-cross">+</div>
      </div>
      <div className="hero-bottom">
        <a href="#offres">
          DÉCOUVRIR NOS OFFRES <ArrowDown size={16} />
        </a>
        <span>
          Création de site à partir de 349 €. Nom de domaine inclus pendant la
          première année.
        </span>
        <span className="hero-coordinate">[ L / W — 2026 ]</span>
      </div>
    </section>
  );
}
function Home() {
  return (
    <>
      <Hero />
      <div className="client-strip wrap">
        <span>ILS NOUS ONT CONFIÉ LEUR PROJET</span>
        <div>
          {[
            "Fan Tour Zanzibar",
            "Instinct Végétal",
            "CF Coiffure",
            "Biorythme",
            "Nicolas & Sarazin",
            "ALLCX Patrimoine",
          ].map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>
      <section className="section wrap home-statement">
        <Label number="01">UN SITE ADAPTÉ À VOTRE ENTREPRISE</Label>
        <Reveal>
          <h2>
            Chaque entreprise
            <br />
            <span>est différente.</span>
            <br />
            Votre site aussi.
          </h2>
        </Reveal>
        <div className="statement-copy">
          <ArrowDownRight size={48} />
          <p>
            Nous créons, gérons et développons la visibilité de sites internet
            pour les indépendants, petites entreprises, agences et sociétés qui
            recherchent une solution professionnelle à un tarif accessible.
          </p>
          <p>
            Nous construisons votre site en fonction de votre activité, de
            votre image et de vos besoins, sans vous faire payer des
            fonctionnalités dont vous n’avez pas besoin. Notre objectif est
            simple : vous proposer un site professionnel, moderne et efficace
            avec des tarifs clairs.
          </p>
          <a className="text-link" href="/a-propos">
            Pourquoi travailler avec nous <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="section work-section" id="realisations">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <Label number="02">QUELQUES PROJETS, BEAUCOUP D’IDÉES</Label>
              <h2>
                Du concret.
                <br />
                <em>Pas du blabla.</em>
              </h2>
            </div>
            <a className="text-link" href="/realisations">
              Voir les {projects.length} réalisations <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="work-grid">
            {projects.slice(0, 4).map((p, i) => (
              <ProjectCard key={p.name} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>
      <div className="marquee" aria-label="Design, développement, impact">
        <div aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>
              DESIGN{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>{" "}
              CODE{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>{" "}
              IMPACT{" "}
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
            <Label number="03">NOS SERVICES</Label>
            <h2>
              Création, gestion
              <br />
              <em>et visibilité.</em>
            </h2>
          </div>
          <p>
            Créer, c’est le début. Ensuite, on garde
            <br />
            votre site en ligne, à jour et visible.
          </p>
        </div>
        <div className="service-rows">
          {services.map((s) => (
            <Reveal key={s.number}>
              <a
                href={`/services#service-${s.number}`}
                className="service-row"
              >
                <span className="service-number">{s.number}</span>
                <h3>{s.title}</h3>
                <span className="service-row-tag">{s.tag}</span>
                <ArrowUpRight size={27} />
              </a>
            </Reveal>
          ))}
        </div>
        <a className="text-link" href="/services">
          Découvrir tous nos services <ArrowUpRight size={17} />
        </a>
      </section>
      <DigitalServicesSection />
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="POUR QUI ?">UN SITE POUR CHAQUE MÉTIER</Label>
            <h2>
              Vous êtes…
              <br />
              <em>on connaît.</em>
            </h2>
          </div>
          <p>
            Artisans, cabinets, commerces, associations :
            <br />
            chaque métier a son site. Le vôtre aussi.
          </p>
        </div>
        <div className="filter-bar">
          <div>
            {audiences.map((a) => (
              <a key={a} className="filter" href="/contact">
                {a}
              </a>
            ))}
          </div>
        </div>
        <a className="text-link" href="/realisations">
          Voir ce qu’on a fait pour eux <ArrowUpRight size={17} />
        </a>
      </section>
      <section className="method-home section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <Label number="04">COMMENT ÇA FONCTIONNE ?</Label>
              <h2>
                On avance.
                <br />
                <em>Ensemble.</em>
              </h2>
            </div>
            <Action href="/methode" light>
              Comment ça se passe
            </Action>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <Reveal key={s.note} delay={i * 0.1}>
                <span className="step-n">
                  0{i + 1}
                  <ArrowRight size={22} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap" id="offres">
        <div className="section-heading">
          <div>
            <Label number="05">NOS OFFRES</Label>
            <h2>
              Des prix clairs,
              <br />
              <em>connus à l’avance.</em>
            </h2>
          </div>
          <p>
            Vous connaissez le prix de votre projet
            <br />
            avant son lancement. Pas de mauvaise surprise.
          </p>
        </div>
        <PriceCards />
        <p className="price-note">
          Nom de domaine inclus pendant la première année. Options et
          abonnements de maintenance dès 39 € / mois.{" "}
          <a href="/offres">
            Voir toutes les offres <ArrowUpRight size={13} />
          </a>
        </p>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <Label number="PROMIS">CE QU’ON VOUS ÉPARGNE</Label>
            <h2>
              Tout ce que vous
              <br />
              <em>n’aurez pas.</em>
            </h2>
          </div>
          <p>
            Un site, ça devrait être simple.
            <br />
            Voilà ce qu’on laisse à la porte.
          </p>
        </div>
        <div className="values-grid">
          {spared.map((s, i) => {
            const Icon = [Ban, Receipt, Turtle, Copy, PhoneOff, Hourglass][i];
            return (
              <Reveal key={s.title} delay={(i % 3) * 0.1}>
                <Icon size={30} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            );
          })}
        </div>
      </section>
      <section className="section wrap home-faq">
        <div>
          <Label number="06">QUESTIONS FRÉQUENTES</Label>
          <h2>
            Avant de
            <br />
            <em>se lancer.</em>
          </h2>
          <a className="text-link" href="/faq">
            Toutes les réponses <ArrowUpRight size={17} />
          </a>
        </div>
        <FAQList items={[faqs[0], faqs[9], faqs[5], faqs[7]]} />
      </section>
      <ContactBand />
    </>
  );
}
function Services() {
  return (
    <>
      <Headline
        label="NOS SERVICES"
        title="Création, gestion"
        em="et visibilité."
        description="Nous pouvons vous accompagner pendant toute la vie de votre site : sa création, sa gestion au quotidien et le développement progressif de sa visibilité."
      />
      <section className="wrap section services-detail">
        {services.map((s) => (
          <Reveal key={s.number} className="service-detail">
            <div id={`service-${s.number}`} className="service-detail-anchor" />
            <span className="service-number">{s.number} /</span>
            <div>
              <span className="eyebrow">{s.tag}</span>
              <h2>{s.title}</h2>
            </div>
            <div>
              <p>{s.text}</p>
              <ul>
                {s.includes.map((f) => (
                  <li key={f}>
                    <Check size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                className="text-link"
                href={s.number === "01" ? "/offres" : "/offres#maintenance"}
              >
                Voir les offres <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>
        ))}
      </section>
      <DigitalServicesSection />
      <div className="assurance-band wrap">
        <ShieldCheck />
        <p>
          Votre site vous appartient.
          <span>Code, contenus, domaine : vous gardez la main.</span>
        </p>
        <a href="/faq">
          En savoir plus <ArrowUpRight size={16} />
        </a>
      </div>
      <ContactBand />
    </>
  );
}
function Work() {
  const [filter, setFilter] = useState("Tous les projets");
  const visible =
    filter === "Tous les projets"
      ? projects
      : projects.filter((p) => p.category === filter);
  return (
    <>
      <Headline
        label="RÉALISATIONS"
        title="Des idées qui"
        em="ont pris leur place."
        description={`Des sites vitrines aux outils métier, ${projects.length} projets confiés à Lullin Web. Chaque besoin, sa réponse — et chaque site, son caractère.`}
      />
      <section className="wrap section all-work">
        <div className="filter-bar">
          <div aria-label="Filtrer les réalisations">
            {[
              "Tous les projets",
              "Site vitrine",
              "E-commerce",
              "Application métier",
            ].map((f) => (
              <button
                key={f}
                className={filter === f ? "filter active" : "filter"}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <span aria-live="polite">
            {visible.length} projet{visible.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="work-grid">
          {visible.map((p) => (
            <ProjectCard key={p.name} project={p} index={projects.indexOf(p)} />
          ))}
        </div>
        <p className="portfolio-note">
          Sélection issue du portfolio de Lullin Web. Les visuels proviennent
          des projets présentés ; les sites peuvent évoluer après leur
          livraison.
        </p>
      </section>
      <ContactBand />
    </>
  );
}
function Method() {
  return (
    <>
      <Headline
        label="COMMENT ÇA FONCTIONNE ?"
        title="Six étapes."
        em="Un seul interlocuteur."
        description="De la présentation de votre projet à la mise en ligne, puis à la gestion de votre site : vous savez à chaque étape ce que nous faisons et ce que vous validez."
      />
      <section className="wrap section method-detail">
        {steps.map((s, i) => (
          <Reveal key={s.note} className="method-step">
            <div className="method-marker">
              <span>0{i + 1}</span>
              <i />
            </div>
            <div>
              <span className="eyebrow">{s.note.split(" / ")[1]}</span>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              <div className="method-deliverable">
                <CheckCheck size={19} />
                {s.deliverable}
              </div>
            </div>
          </Reveal>
        ))}
      </section>
      <section className="wrap before-start">
        <Label>POUR PRÉPARER NOTRE PREMIER ÉCHANGE</Label>
        <h2>
          Venez avec une idée.
          <br />
          <em>On pose le reste ensemble.</em>
        </h2>
        <div>
          {[
            "Ce que fait votre entreprise",
            "Ce que vous attendez de votre site",
            "Votre calendrier et votre budget",
          ].map((t, i) => (
            <span key={t}>
              <small>0{i + 1}</small>
              {t}
            </span>
          ))}
        </div>
      </section>
      <ContactBand />
    </>
  );
}
function About() {
  return (
    <>
      <Headline
        label="L’AGENCE"
        title="Pourquoi travailler"
        em="avec nous ?"
        description="Nous créons, gérons et développons la visibilité de sites internet pour les indépendants, petites entreprises, agences et sociétés qui recherchent une solution professionnelle à un tarif accessible."
      />
      <section className="wrap section about-split">
        <div className="about-visual">
          <img
            className="brand-mark"
            src="/images/lullin-mark.svg"
            alt="La marque de Lullin Web"
            width="340"
            height="340"
          />
          <span>ON NE FAIT PAS JUSTE DES SITES.</span>
          <strong>
            On crée
            <br />
            des connexions.
          </strong>
          <small>[ LULLIN / WEB ]</small>
        </div>
        <div>
          <Label number="01">DES TARIFS ACCESSIBLES</Label>
          <h2>
            Des prix clairs.
            <br />
            <em>Pas de mauvaise surprise.</em>
          </h2>
          <p>
            Un site professionnel ne doit pas forcément coûter plusieurs
            milliers d’euros. Nous avons construit nos offres pour proposer des
            solutions adaptées aux entreprises qui souhaitent maîtriser leur
            budget.
          </p>
          <p>
            Vous connaissez le prix de votre projet avant son lancement. Pas de
            mauvaise surprise à la fin.
          </p>
          <Action href="/offres">Découvrir nos offres</Action>
        </div>
      </section>
      <section className="section wrap">
        <Label number="02">CE QUI FAIT LA DIFFÉRENCE</Label>
        <div className="values-grid">
          {[
            {
              icon: UserRound,
              title: "Un seul interlocuteur.",
              text: "De la création à la maintenance, nous pouvons gérer l’ensemble de votre site.",
            },
            {
              icon: Code2,
              title: "Des sites modernes.",
              text: "Nous utilisons des technologies modernes afin de proposer des sites rapides, sécurisés et adaptés aux différents appareils.",
            },
            {
              icon: Globe2,
              title: "Un accompagnement sur le long terme.",
              text: "Nous pouvons continuer à gérer votre site après sa création afin que vous n’ayez pas à vous occuper des aspects techniques.",
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
      <ContactBand />
    </>
  );
}
function Offers() {
  return (
    <>
      <Headline
        label="NOS OFFRES"
        title="Un site professionnel."
        em="À partir de 349 €."
        description="Des tarifs clairs, le nom de domaine inclus pendant la première année et uniquement les fonctionnalités dont vous avez réellement besoin."
      />
      <div className="marquee" aria-label="Simple, rapide, dès 349 euros">
        <div aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>
              SIMPLE{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>{" "}
              RAPIDE{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>{" "}
              DÈS 349 €{" "}
              <i aria-hidden="true">
                <Asterisk />
              </i>
            </span>
          ))}
        </div>
      </div>
      <section className="section wrap offers-page">
        <PriceCards />
        <p className="price-note">
          Le prix dépend principalement du nombre de pages, du design et des
          fonctionnalités nécessaires. La majorité de nos offres de création
          restent sous les 1 000 €.
        </p>
      </section>
      <section className="wrap before-start">
        <Label number="COMMENT CHOISIR ?">LA BONNE FORMULE EN 10 SECONDES</Label>
        <h2>
          Vous voulez surtout…
          <br />
          <em>on vous dit laquelle.</em>
        </h2>
        <div>
          {[
            "Être trouvé et joignable rapidement → Essentiel",
            "Présenter vos services en détail → Vitrine",
            "Faire de votre site un vrai outil commercial → Business ou Premium",
          ].map((t, i) => (
            <span key={t}>
              <small>0{i + 1}</small>
              {t}
            </span>
          ))}
        </div>
      </section>
      <div className="assurance-band wrap">
        <Sparkles />
        <p>
          Besoin de quelque chose de différent ?
          <span>
            Votre projet ne rentre pas exactement dans une formule ? Aucun
            problème. Nous pouvons créer une offre personnalisée en fonction du
            nombre de pages, des fonctionnalités et des besoins de votre
            entreprise.
          </span>
        </p>
        <a href="/contact?type=Projet%20personnalis%C3%A9">
          Obtenir mon devis <ArrowUpRight size={16} />
        </a>
      </div>
      <section className="section wrap offers-options">
        <div className="section-heading">
          <div>
            <Label number="OPTIONS">OPTIONS SUPPLÉMENTAIRES</Label>
            <h2>
              Ajoutez uniquement
              <br />
              <em>ce dont vous avez besoin.</em>
            </h2>
          </div>
          <p>
            Des options à ajouter à votre formule,
            <br />
            selon les besoins de votre entreprise.
          </p>
        </div>
        <OptionsGrid />
      </section>
      <section className="section wrap offers-maintenance" id="maintenance">
        <div className="section-heading">
          <div>
            <Label number="MAINTENANCE">NOS ABONNEMENTS DE MAINTENANCE</Label>
            <h2>
              Votre site reste
              <br />
              <em>entre de bonnes mains.</em>
            </h2>
          </div>
          <p>
            Créer un site est une première étape. Il faut ensuite le surveiller,
            le maintenir, effectuer les modifications nécessaires et s’assurer
            qu’il reste rapide et fonctionnel. Nous pouvons nous occuper de tout
            pour vous.
          </p>
        </div>
        <PriceCards items={maintenancePlans} />
        <p className="price-note">
          La création du site et l’abonnement de maintenance sont deux services
          différents. Vous pouvez simplement acheter votre site ou choisir de
          nous confier également sa gestion.
        </p>
      </section>
      <div className="assurance-band wrap">
        <Layers />
        <p>
          Besoin aussi de photos, d’une vidéo ou de publications ?
          <span>
            Nos packs de communication associent la création de votre site à
            des photos, une vidéo ou des publications, à prix unique.
          </span>
        </p>
        <a href="/packs">
          Voir les packs <ArrowUpRight size={16} />
        </a>
      </div>
      <section className="section wrap home-faq">
        <div>
          <Label>POUR CHOISIR SEREINEMENT</Label>
          <h2>
            Tout est
            <br />
            <em>posé à l’avance.</em>
          </h2>
        </div>
        <FAQList items={[faqs[0], faqs[1], faqs[5], faqs[6]]} />
      </section>
      <ContactBand />
    </>
  );
}
function FAQPage() {
  const [group, setGroup] = useState("Toutes");
  const groups = ["Toutes", ...new Set(faqs.map((f) => f.group))];
  const filtered =
    group === "Toutes" ? faqs : faqs.filter((f) => f.group === group);
  return (
    <>
      <Headline
        label="QUESTIONS FRÉQUENTES"
        title="Tout simplement,"
        em="les réponses."
        description="Le budget, les étapes, la propriété du site ou la maintenance : ce qu’il faut savoir avant de démarrer."
      />
      <section className="wrap section faq-page">
        <aside>
          <span className="eyebrow">VOTRE QUESTION CONCERNE</span>
          {groups.map((g) => (
            <button
              key={g}
              aria-pressed={g === group}
              className={g === group ? "active" : ""}
              onClick={() => setGroup(g)}
            >
              {g}
              <ArrowUpRight size={16} />
            </button>
          ))}
          <a href="mailto:contact@lullin-web.com">
            Une autre question ?<br />
            <strong>
              Écrivez-nous <ArrowUpRight size={14} />
            </strong>
          </a>
        </aside>
        <FAQList key={group} items={filtered} />
      </section>
      <ContactBand />
    </>
  );
}
// Brief placeholder for each communication service (website requests keep the original text).
const briefPlaceholders: Record<string, string> = {
  "Réseaux sociaux":
    "Votre activité, les réseaux sur lesquels vous publiez et ce que vous souhaitez y montrer…",
  Photographie:
    "Ce que vous souhaitez photographier, le lieu, la date envisagée et l’usage des photos…",
  Vidéo:
    "Votre idée de vidéo, la durée souhaitée, les images dont vous disposez et où elle sera diffusée…",
  "Référencement SEO":
    "L’adresse de votre site, votre activité, votre secteur géographique et vos objectifs…",
  "Packs de communication":
    "Votre activité, votre présence actuelle en ligne et ce que vous souhaitez obtenir…",
};
function Contact() {
  const query = new URLSearchParams(location.search);
  // ?service=…&offre=… arrive from the communication pages (social media, photo, video, SEO, packs).
  const requestedService = serviceCatalog.find(
    (s) => s.service === query.get("service"),
  );
  const [step, setStep] = useState(1);
  // An empty service is a website request: the original form, unchanged.
  const [service, setService] = useState(requestedService?.service || "");
  const [type, setType] = useState(
    requestedService
      ? requestedService.rates.some((r) => r.name === query.get("offre"))
        ? query.get("offre")!
        : undecidedRate.name
      : projectTypes.includes(query.get("type") || "")
        ? query.get("type")!
        : projectTypes[0],
  );
  const [fields, setFields] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    budget: budgets[0],
    existing: "",
    options: [] as string[],
    // Pre-selected when the visitor arrives from a maintenance plan button.
    maintenance: maintenanceChoices.some(
      (m) => m.value === query.get("maintenance"),
    )
      ? query.get("maintenance")!
      : "",
    description: "",
    consent: false,
    website: "",
  });
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [sendError, setSendError] = useState("");
  const sendingRef = useRef(false);
  const requestRef = useRef<{ payload: string; id: string } | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const offer = requestedService ? "" : query.get("offre") || "";
  const siteOffer = offers.find((o) => o.name === offer);
  const offerPrice = siteOffer
    ? `${siteOffer.kicker === "À PARTIR DE" ? "à partir de " : ""}${siteOffer.price} ${siteOffer.suffix}`
    : "";
  const rateChoices = service
    ? [
        ...(serviceCatalog.find((s) => s.service === service)?.rates || []),
        undecidedRate,
      ]
    : [];
  const rate = rateChoices.find((r) => r.name === type);
  const chooseService = (value: string) => {
    requestRef.current = null;
    setSendError("");
    setService(value);
    setType(value ? undecidedRate.name : projectTypes[0]);
  };
  const sending = sendState === "sending";
  const focusTitle = () =>
    requestAnimationFrame(() => {
      const title = titleRef.current;
      if (!title) return;
      if (matchMedia("(max-width: 800px)").matches) {
        title.focus({ preventScroll: true });
        title.scrollIntoView({ block: "start", behavior: "instant" });
      } else title.focus();
    });
  const updateFields = (value: Partial<typeof fields>) => {
    requestRef.current = null;
    setSendError("");
    setFields((current) => ({ ...current, ...value }));
  };
  const goToStep = (value: number) => {
    if (sendingRef.current) return;
    setStep(value);
    setSendError("");
    focusTitle();
  };
  const next = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    goToStep(3);
  };
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendingRef.current || sendState === "sent") return;
    sendingRef.current = true;
    setSendState("sending");
    setSendError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      // Communication services skip the website questions (existing site, options, maintenance).
      const payload = service
        ? {
            service,
            type,
            name: fields.name,
            company: fields.company,
            email: fields.email,
            phone: fields.phone,
            budget: fields.budget,
            description: fields.description,
            consent: fields.consent,
            website: fields.website,
          }
        : { type, offer, ...fields };
      const fingerprint = JSON.stringify(payload);
      // Keep the same id after a network failure so a retry cannot duplicate this request.
      if (requestRef.current?.payload !== fingerprint) {
        requestRef.current = { payload: fingerprint, id: crypto.randomUUID() };
      }
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestId: requestRef.current.id }),
        signal: controller.signal,
      });
      const result: unknown = await response.json().catch(() => null);
      if (
        !response.ok ||
        !result ||
        typeof result !== "object" ||
        !("ok" in result) ||
        result.ok !== true ||
        !("id" in result) ||
        typeof result.id !== "string" ||
        !result.id.trim()
      ) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string" &&
          result.error.trim()
            ? result.error
            : "L’envoi n’a pas pu être confirmé. Vos informations sont conservées : veuillez réessayer.";
        throw new Error(message);
      }
      setSendState("sent");
      focusTitle();
    } catch (error) {
      setSendState("idle");
      setSendError(
        controller.signal.aborted
          ? "La confirmation de l’envoi prend trop de temps. Gardez cette page ouverte et réessayez dans quelques instants."
          : error instanceof Error && error.name !== "TypeError"
            ? error.message
            : "La connexion a été interrompue. Vos informations sont conservées : veuillez réessayer.",
      );
    } finally {
      window.clearTimeout(timeout);
      sendingRef.current = false;
    }
  };
  return (
    <section className="wrap contact-page">
      <div className="contact-copy">
        <Label>CONTACT</Label>
        <h1>
          Parlons de
          <br />
          <em>
            votre
            <br /> projet.
          </em>
        </h1>
        <p>
          Expliquez-nous simplement ce dont vous avez besoin.{" "}
          <br />
          Vous recevez une proposition adaptée à votre projet.
        </p>
        <div className="contact-promises">
          <span>
            <Check size={16} />
            Devis gratuit et sans engagement
          </span>
          <span>
            <Check size={16} />
            Sites internet à partir de 349 €
          </span>
          <span>
            <Check size={16} />
            Un seul interlocuteur
          </span>
        </div>
        <div className="contact-direct">
          <span>VOUS PRÉFÉREZ NOUS ÉCRIRE OU NOUS APPELER ?</span>
          <a href={`mailto:${legal.email}`}>
            {legal.email} <ArrowUpRight size={20} />
          </a>
          <a href={legal.phoneHref}>
            {legal.phone} <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="contact-orbit" aria-hidden="true">
          <img
            className="brand-mark"
            src="/images/lullin-mark.svg"
            alt=""
            width="240"
            height="240"
          />
        </div>
      </div>
      <div className="brief-form">
        <div
          className="brief-progress"
          aria-label={
            sendState === "sent" ? "Demande envoyée" : `Étape ${step} sur 3`
          }
        >
          {["Votre projet", "Les détails", "Votre message"].map((s, i) => (
            <span key={s} className={step >= i + 1 ? "active" : ""}>
              <i>
                {step > i + 1 || sendState === "sent" ? (
                  <Check size={13} />
                ) : (
                  i + 1
                )}
              </i>
              {s}
            </span>
          ))}
        </div>
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {sending
            ? "Envoi de votre demande en cours."
            : sendState === "sent"
              ? "Votre demande a été envoyée. Nous vous répondons sous 48 h ouvrées."
              : ""}
        </p>
        <div key={step} className="brief-step">
          {step === 1 ? (
            <>
              <span className="eyebrow">01 / LE POINT DE DÉPART</span>
              <h2 ref={titleRef} tabIndex={-1}>
                {service
                  ? "Quelle prestation vous intéresse ?"
                  : "Quel type de site souhaitez-vous ?"}
              </h2>
              <p>Choisissez ce qui ressemble le plus à votre besoin.</p>
              <fieldset className="service-switch">
                <legend>Votre demande concerne</legend>
                <div>
                  {["", ...serviceCatalog.map((s) => s.service)].map((s) => (
                    <label key={s} className={service === s ? "selected" : ""}>
                      <input
                        type="radio"
                        name="service"
                        value={s}
                        checked={service === s}
                        onChange={() => chooseService(s)}
                      />
                      {s || "Site internet"}
                    </label>
                  ))}
                </div>
              </fieldset>
              {service ? (
                <fieldset className="type-options rate-options">
                  <legend className="sr-only">Prestation souhaitée</legend>
                  {rateChoices.map((r) => (
                    <label
                      key={r.name}
                      className={type === r.name ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={r.name}
                        checked={type === r.name}
                        onChange={() => {
                          requestRef.current = null;
                          setType(r.name);
                        }}
                      />
                      <span>
                        {r.name}
                        <small>{r.price}</small>
                      </span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <fieldset className="type-options">
                  <legend className="sr-only">Type de projet</legend>
                  {projectTypes.map((t, i) => (
                    <label key={t} className={type === t ? "selected" : ""}>
                      <input
                        type="radio"
                        name="type"
                        value={t}
                        checked={type === t}
                        onChange={() => {
                          requestRef.current = null;
                          setType(t);
                        }}
                      />
                      <span>
                        <small>0{i + 1}</small>
                        {t}
                      </span>
                      <ArrowUpRight size={18} />
                    </label>
                  ))}
                </fieldset>
              )}
              {!service && offer && (
                <p className="selected-offer">
                  Vous explorez l’offre <strong>{offer}</strong>
                  {offerPrice && <> · <span>{offerPrice}</span></>}.
                </p>
              )}
              {rate && rate !== undecidedRate && (
                <p className="selected-offer">
                  {service} · <strong>{rate.name}</strong> ·{" "}
                  <span>{rate.price}</span>.
                  Tarif de lancement, confirmé par un devis gratuit.
                </p>
              )}
              <button className="form-next" onClick={() => goToStep(2)}>
                Continuons <ArrowRight size={19} />
              </button>
              <p className="form-footnote">
                Deux minutes pour faire le premier pas. Formulaire sécurisé
                (HTTPS), aucune prestation sans devis accepté.
              </p>
            </>
          ) : step === 2 ? (
            <form onSubmit={next}>
              <span className="eyebrow">02 / FAISONS CONNAISSANCE</span>
              <h2 ref={titleRef} tabIndex={-1}>
                Quelques détails.
              </h2>
              <p>Les champs marqués d’un * sont nécessaires.</p>
              <div className="field-grid">
                <label>
                  Nom et prénom *
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={fields.name}
                    onChange={(e) => updateFields({ name: e.target.value })}
                    placeholder="Prénom et nom"
                  />
                </label>
                <label>
                  Entreprise
                  <input
                    name="company"
                    autoComplete="organization"
                    maxLength={120}
                    value={fields.company}
                    onChange={(e) => updateFields({ company: e.target.value })}
                    placeholder="Nom de votre entreprise"
                  />
                </label>
                <label>
                  Adresse e-mail *
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    value={fields.email}
                    onChange={(e) => updateFields({ email: e.target.value })}
                    placeholder="vous@entreprise.fr"
                  />
                </label>
                <label>
                  Téléphone
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    maxLength={30}
                    value={fields.phone}
                    onChange={(e) => updateFields({ phone: e.target.value })}
                    placeholder="06 00 00 00 00"
                  />
                </label>
                {!service && (
                  <label>
                    Avez-vous déjà un site internet ? *
                    <select
                      name="existing"
                      required
                      value={fields.existing}
                      onChange={(e) => updateFields({ existing: e.target.value })}
                    >
                      <option value="" disabled>
                        Choisissez
                      </option>
                      {existingSiteAnswers.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  Budget envisagé
                  <select
                    name="budget"
                    value={fields.budget}
                    onChange={(e) => updateFields({ budget: e.target.value })}
                  >
                    {budgets.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="field-wide">
                  Parlez-nous de votre projet *
                  <textarea
                    name="description"
                    required
                    minLength={20}
                    maxLength={5000}
                    rows={5}
                    value={fields.description}
                    onChange={(e) =>
                      updateFields({ description: e.target.value })
                    }
                    placeholder={
                      briefPlaceholders[service] ||
                      "Votre activité, vos besoins et ce que vous souhaitez obtenir avec votre site…"
                    }
                  />
                  <small>20 caractères minimum.</small>
                </label>
              </div>
              {!service && (
                <>
                  <fieldset className="option-choices">
                    <legend>
                      Souhaitez-vous des options en plus ? <span>(facultatif)</span>
                    </legend>
                    <div>
                      {options.map((o) => {
                        const checked = fields.options.includes(o.title);
                        return (
                          <label key={o.title} className={checked ? "selected" : ""}>
                            <input
                              type="checkbox"
                              name="options"
                              value={o.title}
                              checked={checked}
                              onChange={(e) =>
                                updateFields({
                                  options: e.target.checked
                                    ? options
                                        .map((item) => item.title)
                                        .filter(
                                          (title) =>
                                            title === o.title ||
                                            fields.options.includes(title),
                                        )
                                    : fields.options.filter((t) => t !== o.title),
                                })
                              }
                            />
                            <span>
                              {o.title}
                              <small>{o.short}</small>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <fieldset className="option-choices">
                    <legend>Souhaitez-vous un abonnement de maintenance ? *</legend>
                    <div>
                      {maintenanceChoices.map((m) => (
                        <label
                          key={m.value}
                          className={
                            fields.maintenance === m.value ? "selected" : ""
                          }
                        >
                          <input
                            type="radio"
                            name="maintenance"
                            value={m.value}
                            required
                            checked={fields.maintenance === m.value}
                            onChange={() => updateFields({ maintenance: m.value })}
                          />
                          <span>
                            {m.value}
                            <small>{m.short}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}
              <label className="form-honeypot" aria-hidden="true">
                Votre site internet
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={fields.website}
                  onChange={(e) => updateFields({ website: e.target.value })}
                />
              </label>
              <label className="consent">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  checked={fields.consent}
                  onChange={(e) => updateFields({ consent: e.target.checked })}
                />
                <span>
                  J’accepte d’être recontacté au sujet de ce projet.{" "}
                  <a href="/confidentialite" target="_blank" rel="noreferrer">
                    Confidentialité
                  </a>
                </span>
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="back"
                  onClick={() => goToStep(1)}
                >
                  <ChevronLeft size={16} />
                  Retour
                </button>
                <button className="form-next" type="submit">
                  Vérifier ma demande <ArrowRight size={17} />
                </button>
              </div>
            </form>
          ) : sendState === "sent" ? (
            <>
              <div className="brief-ready">
                <CheckCheck size={28} />
              </div>
              <span className="eyebrow">03 / LE PREMIER PAS EST FAIT</span>
              <h2 ref={titleRef} tabIndex={-1}>
                Votre demande a été envoyée.
              </h2>
              <p>
                Merci pour votre confiance. Votre projet est entre nos mains :
                nous vous répondons sous 48 h ouvrées à{" "}
                <strong>{fields.email}</strong>.
              </p>
              <a className="form-next" href="/realisations">
                Découvrir nos réalisations <ArrowUpRight size={17} />
              </a>
            </>
          ) : (
            <form onSubmit={send} aria-busy={sending}>
              <span className="eyebrow">03 / UN DERNIER REGARD</span>
              <h2 ref={titleRef} tabIndex={-1}>
                Votre demande est prête.
              </h2>
              <p>
                Vérifiez les détails, puis envoyez votre demande directement à
                Lullin Web.
              </p>
              <dl className="brief-recap">
                {service ? (
                  <>
                    <div>
                      <dt>Service</dt>
                      <dd>{service}</dd>
                    </div>
                    <div>
                      <dt>Prestation</dt>
                      <dd>{type}</dd>
                    </div>
                    <div>
                      <dt>Tarif affiché</dt>
                      <dd>
                        {rate?.price}
                        {rate !== undecidedRate &&
                          " · tarif de lancement, confirmé sur devis"}
                      </dd>
                    </div>
                  </>
                ) : (
                  <>
                  <div>
                    <dt>Projet</dt>
                    <dd>{type}</dd>
                  </div>
                  {offer && (
                    <div>
                      <dt>Offre</dt>
                      <dd>
                        {offer}
                        {offerPrice && ` · ${offerPrice}`}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>Site existant</dt>
                    <dd>{fields.existing}</dd>
                  </div>
                  </>
                )}
                <div>
                  <dt>Budget</dt>
                  <dd>{fields.budget}</dd>
                </div>
                {!service && (
                  <>
                  <div>
                    <dt>Options</dt>
                    <dd>
                      {fields.options.length
                        ? fields.options.join(", ")
                        : "Aucune pour le moment"}
                    </dd>
                  </div>
                  <div>
                    <dt>Maintenance</dt>
                    <dd>{fields.maintenance}</dd>
                  </div>
                  </>
                )}
                <div>
                  <dt>Contact</dt>
                  <dd>
                    {fields.name}
                    {fields.company && (
                      <>
                        <br />
                        {fields.company}
                      </>
                    )}
                    <br />
                    {fields.email}
                    {fields.phone && (
                      <>
                        <br />
                        {fields.phone}
                      </>
                    )}
                  </dd>
                </div>
              </dl>
              <p className="brief-message">{fields.description}</p>
              <label className="form-honeypot" aria-hidden="true">
                Votre site internet
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={fields.website}
                  disabled={sending}
                  onChange={(e) => updateFields({ website: e.target.value })}
                />
              </label>
              {sendError && (
                <p className="form-error" role="alert">
                  {sendError}
                </p>
              )}
              <button className="form-next" type="submit" disabled={sending}>
                {sending
                  ? "Envoi en cours…"
                  : sendError
                    ? "Réessayer l’envoi"
                    : "Envoyer ma demande"}
                <Send size={17} />
              </button>
              <div className="form-actions">
                <button
                  className="back"
                  type="button"
                  disabled={sending}
                  onClick={() => goToStep(2)}
                >
                  <ChevronLeft size={16} />
                  Modifier
                </button>
              </div>
              <p className="form-footnote">
                En cliquant sur « Envoyer ma demande », vous transmettez vos
                informations à Lullin Web via Resend afin de recevoir une
                réponse à votre projet.{" "}
                <a href="/confidentialite" target="_blank" rel="noreferrer">
                  Confidentialité
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
function NotFound() {
  return (
    <section className="wrap not-found">
      <span>404</span>
      <h1>
        Cette page a pris
        <br />
        <em>une autre direction.</em>
      </h1>
      <Action href="/">Revenir à l’accueil</Action>
    </section>
  );
}
const routes: Record<string, { title: string; page: React.ComponentType }> = {
  "/": { title: "Votre site professionnel, simplement.", page: Home },
  "/services": { title: "Nos expertises", page: Services },
  "/realisations": { title: "Nos réalisations", page: Work },
  "/methode": { title: "Notre méthode", page: Method },
  "/a-propos": { title: "L’agence", page: About },
  "/offres": { title: "Les offres", page: Offers },
  "/faq": { title: "Questions fréquentes", page: FAQPage },
  "/contact": { title: "Parlons de votre projet", page: Contact },
  "/confidentialite": { title: "Confidentialité", page: Privacy },
  "/mentions-legales": { title: "Mentions légales", page: MentionsLegales },
  "/cgv": { title: "Conditions générales de vente", page: CGV },
  "/partenaires": { title: "Devenir partenaire", page: Partners },
  "/reseaux-sociaux": { title: "Réseaux sociaux", page: SocialMedia },
  "/photographie": { title: "Photographie", page: Photography },
  "/video": { title: "Vidéo", page: VideoPage },
  "/referencement-seo": { title: "Référencement SEO", page: SeoPage },
  "/packs": { title: "Nos packs", page: PacksPage },
};
export default function App() {
  const current = routes[path];
  const Page = current?.page || NotFound;
  useEffect(() => {
    const page = seo[path as keyof typeof seo];
    const canonical = `https://www.lullin-web.com${path === "/" ? "/" : path}`;
    const setMeta = (selector: string, value: string) =>
      document
        .querySelector<HTMLMetaElement>(selector)
        ?.setAttribute("content", value);
    document.title = page?.title || "Page introuvable | Lullin Web";
    setMeta(
      'meta[name="description"]',
      page?.description || "Cette page est introuvable.",
    );
    setMeta(
      'meta[name="robots"]',
      page
        ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        : "noindex,follow",
    );
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", canonical);
    setMeta('meta[property="og:title"]', document.title);
    setMeta(
      'meta[property="og:description"]',
      page?.description || "Cette page est introuvable.",
    );
    setMeta('meta[property="og:url"]', canonical);
    setMeta('meta[name="twitter:title"]', document.title);
    setMeta(
      'meta[name="twitter:description"]',
      page?.description || "Cette page est introuvable.",
    );
  }, [current]);
  return (
    <Experience>
      <div id="top" />
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <Header />
      <main id="main">
        <Page />
      </main>
      <Footer />
    </Experience>
  );
}
