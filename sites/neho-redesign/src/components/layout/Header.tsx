import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { HeaderClient } from "./HeaderClient";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return <HeaderClient locale={locale} nav={dict.nav} />;
}
