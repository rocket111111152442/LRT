import { siteConfig } from "@/config/site";
import { agencies } from "@/lib/data/agencies";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Arc lémanique, Vaud, Suisse",
    },
    location: agencies.map((agency) => ({
      "@type": "LocalBusiness",
      name: agency.name,
      telephone: agency.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: agency.street,
        postalCode: agency.postalCode,
        addressLocality: agency.city,
        addressCountry: "CH",
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    url: `${siteConfig.url}/actualites/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
