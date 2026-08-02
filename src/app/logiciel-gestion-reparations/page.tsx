import { SeoResourcePage } from "@/components/SeoResourcePage";
import { createSeoResourceMetadata, seoResources } from "@/lib/seoResources";

const resource = seoResources["logiciel-gestion-reparations"];
export const metadata = createSeoResourceMetadata(resource);

export default function Page() {
  return <SeoResourcePage resource={resource} />;
}
