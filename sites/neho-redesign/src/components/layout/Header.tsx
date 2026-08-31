import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/config/site";
import { HeaderClient } from "./HeaderClient";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return <HeaderClient locale={locale} siteName={siteConfig.shortName} nav={dict.nav} />;
}
