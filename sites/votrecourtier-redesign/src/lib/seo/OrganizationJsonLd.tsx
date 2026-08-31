import { offices, site } from "@/config/site";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: site.legalName,
    url: site.url,
    description: site.description,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Canton de Vaud" },
      { "@type": "AdministrativeArea", name: "Canton de Fribourg" },
    ],
    department: offices.map((office) => ({
      "@type": "RealEstateAgent",
      name: `${site.legalName} — ${office.label}`,
      telephone: office.phone,
      email: office.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: office.street,
        postalCode: office.postalCode,
        addressLocality: office.city,
        addressCountry: "CH",
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
