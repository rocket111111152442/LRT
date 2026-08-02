import { SeoResourcePage } from "@/components/SeoResourcePage";
import { createSeoResourceMetadata, seoResources } from "@/lib/seoResources";

const resource = seoResources["logiciel-reparateur-informatique"];
export const metadata = createSeoResourceMetadata(resource);

export default function Page() {
  return <SeoResourcePage resource={resource} />;
}
