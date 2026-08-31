import { siteConfig } from "@/config/site";
import type { Agent, Property, Canton } from "@/lib/data/types";
import type { BlogPost } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils/format";

/**
 * Générateurs de données structurées (JSON-LD). Aucune fonction ici ne
 * fabrique de faux avis, fausse note ou prix obsolète : les valeurs
 * proviennent des mêmes sources que le contenu affiché (voir
 * src/config/site-numbers.ts et src/lib/data).
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    slogan: "Vendre au forfait fixe, sans commission variable (concept de démonstration)",
  };
}

export function realEstateAgentJsonLd(agent: Agent) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.name,
    jobTitle: agent.role,
    url: `${siteConfig.url}/fr/equipe/${agent.slug}`,
    areaServed: agent.communes,
    knowsLanguage: agent.languages,
  };
}

export function personJsonLd(agent: Agent) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: agent.name,
    jobTitle: agent.role,
    knowsLanguage: agent.languages,
  };
}

export function localBusinessJsonLd(canton: Canton) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${siteConfig.name} — ${canton.name}`,
    description: canton.description,
    areaServed: { "@type": "AdministrativeArea", name: canton.name },
  };
}

export function propertyJsonLd(property: Property, communeName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description,
    numberOfRooms: property.rooms || undefined,
    floorSize: property.surface
      ? { "@type": "QuantitativeValue", value: property.surface, unitCode: "MTK" }
      : undefined,
    address: { "@type": "PostalAddress", addressLocality: communeName, addressCountry: "CH" },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "CHF",
      availability:
        property.availability === "disponible"
          ? "https://schema.org/InStock"
          : "https://schema.org/LimitedAvailability",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function articleJsonLd(post: BlogPost, locale: "fr" | "en", url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author.name },
    url,
    inLanguage: locale,
    dateModified: post.publishedAt,
    articleSection: post.category,
  };
}

export function offerJsonLd(tierName: string, price: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `Formule ${tierName} — Ného Concept (démonstration)`,
    priceCurrency: "CHF",
    price: price.replace(/[^0-9]/g, ""),
    availability: "https://schema.org/InStock",
    description: "Tarif de démonstration à vérifier avant toute diffusion — voir docs/neho-audit.md.",
  };
}

export function dateFormatted(iso: string, locale: "fr" | "en") {
  return formatDate(iso, locale);
}
