"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Map as MapIcon, Link2, Bell, AlertTriangle } from "lucide-react";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyListItem } from "@/components/properties/PropertyListItem";
import { PropertyMapView } from "@/components/properties/PropertyMapView";
import { AlertModal } from "@/components/properties/AlertModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/format";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { filterProperties, filtersToSearchParams, type PropertyFilters as Filters } from "@/lib/search/filter-properties";
import type { Property } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

type View = "grid" | "list" | "map";
const PAGE_SIZE = 8;

export function PropertySearchClient({
  locale,
  dict,
  allProperties,
  initialFilters,
  openAlertOnLoad,
  debugForceError,
}: {
  locale: Locale;
  dict: Dictionary;
  allProperties: Property[];
  initialFilters: Filters;
  openAlertOnLoad?: boolean;
  debugForceError?: boolean;
}) {
  const t = dict.properties;
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [view, setView] = useState<View>("grid");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [alertOpen, setAlertOpen] = useState(!!openAlertOnLoad);
  const [copied, setCopied] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { isFavorite, toggle, favorites, ready } = useFavorites();

  // Simule un appel réseau (chargement + éventuelle erreur) même si les
  // données proviennent d'un jeu local — démontre les états requis
  // (chargement, erreur) sans jamais échouer par défaut. `debugForceError`
  // permet de vérifier volontairement l'état d'erreur pendant les tests.
  useEffect(() => {
    // Démarre un minuteur (système externe) à chaque changement de filtre :
    // le passage à "loading" fait partie de cette synchronisation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");
    const timer = setTimeout(() => {
      setStatus(debugForceError ? "error" : "success");
    }, 350);
    return () => clearTimeout(timer);
  }, [filters, debugForceError]);

  useEffect(() => {
    const params = filtersToSearchParams(filters);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    // Synchronise l'URL du navigateur (système externe) avec les filtres
    // courants ; la réinitialisation de la pagination fait partie de la
    // même synchronisation, déclenchée à chaque changement de filtre.
    window.history.replaceState(null, "", url);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const filtered = useMemo(() => {
    const base = filterProperties(allProperties, filters);
    return favoritesOnly ? base.filter((p) => favorites.includes(p.slug)) : base;
  }, [allProperties, filters, favoritesOnly, favorites]);

  const visible = filtered.slice(0, visibleCount);

  function resetFilters() {
    setFilters({});
    setFavoritesOnly(false);
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : on ignore silencieusement, l'URL reste visible dans la barre d'adresse.
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <PropertyFilters filters={filters} onChange={setFilters} onReset={resetFilters} dict={dict} />
        <label className="mt-4 flex items-center gap-2 rounded-2xl border border-stone-200 bg-cream-50 p-3 text-sm text-ink-700">
          <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} className="h-4 w-4 accent-ivy-600" disabled={!ready} />
          {t.favorites.title} {ready && favorites.length > 0 ? `(${favorites.length})` : ""}
        </label>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            {status === "success" ? `${filtered.length} ${t.filters.resultsCount}` : " "}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="sort-select">
              {t.sort.label}
            </label>
            <select
              id="sort-select"
              value={filters.sort ?? "pertinence"}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as Filters["sort"] }))}
              className="input-field h-10 w-auto text-sm"
            >
              {(["pertinence", "prix-asc", "prix-desc", "surface", "recent"] as const).map((value, i) => (
                <option key={value} value={value}>
                  {t.sort.options[i]}
                </option>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-full border border-stone-300">
              {(
                [
                  ["grid", LayoutGrid, t.view.grid],
                  ["list", List, t.view.list],
                  ["map", MapIcon, t.view.map],
                ] as const
              ).map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  aria-label={label}
                  title={label}
                  className={cn("flex h-10 w-10 items-center justify-center", view === key ? "bg-ink-900 text-cream-50" : "text-ink-500 hover:bg-stone-100")}
                >
                  <Icon size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={copyShareUrl}>
              <Link2 size={14} aria-hidden="true" /> {copied ? "✓" : t.shareUrl}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
              <Bell size={14} aria-hidden="true" /> {t.alert.cta}
            </Button>
          </div>
        </div>

        {status === "loading" ? <LoadingState label={t.loading} /> : null}

        {status === "error" ? (
          <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-error-600/30 bg-error-600/5 py-16 text-center">
            <AlertTriangle className="text-error-600" size={28} aria-hidden="true" />
            <p className="font-medium text-ink-900">{t.error}</p>
          </div>
        ) : null}

        {status === "success" && filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 py-16 text-center">
            <p className="font-display text-xl text-ink-900">{t.empty.title}</p>
            <p className="max-w-sm text-sm text-ink-500">{t.empty.description}</p>
            <Button variant="outline" onClick={resetFilters}>
              {t.empty.cta}
            </Button>
          </div>
        ) : null}

        {status === "success" && filtered.length > 0 ? (
          <>
            {view === "grid" ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((p) => (
                  <PropertyCard key={p.slug} property={p} locale={locale} newLabel={dict.home.properties.newBadge} availabilityLabels={dict.properties.availability} />
                ))}
              </div>
            ) : null}
            {view === "list" ? (
              <div className="flex flex-col gap-4">
                {visible.map((p) => (
                  <PropertyListItem
                    key={p.slug}
                    property={p}
                    locale={locale}
                    isFavorite={isFavorite(p.slug)}
                    onToggleFavorite={() => toggle(p.slug)}
                    favoriteLabel={isFavorite(p.slug) ? t.favorites.remove : t.favorites.add}
                  />
                ))}
              </div>
            ) : null}
            {view === "map" ? <PropertyMapView properties={filtered} locale={locale} hint={t.mapHint} /> : null}

            {view !== "map" && visibleCount < filtered.length ? (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  {t.pagination.loadMore}
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} dict={dict} />
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-stone-200">
          <div className="aspect-[4/3] bg-stone-200" />
          <div className="space-y-2 p-5">
            <div className="h-4 w-2/3 rounded bg-stone-200" />
            <div className="h-3 w-1/2 rounded bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
