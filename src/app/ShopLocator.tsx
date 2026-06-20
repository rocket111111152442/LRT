"use client";

import Link from "next/link";
import { Clock, MapPin, Navigation, Phone, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  formatOpeningHours,
  isShopOpenAt,
  todayOpeningLabel,
} from "@/lib/shopHours";

type Shop = {
  companyName: string;
  slug: string;
  description: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  openingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  capacityPerDay: number;
  activeRepairs: number;
  isOpenNow: boolean;
  availableSlots: string[];
  slotDurationMinutes: number;
  hasAvailability: boolean;
};

type Position = {
  latitude: number;
  longitude: number;
};

function distanceKm(from: Position, shop: Shop) {
  if (typeof shop.latitude !== "number" || typeof shop.longitude !== "number") {
    return null;
  }

  const earthRadiusKm = 6371;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (shop.latitude * Math.PI) / 180;
  const deltaLat = ((shop.latitude - from.latitude) * Math.PI) / 180;
  const deltaLon = ((shop.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function addressLabel(shop: Shop) {
  return [shop.address, shop.postalCode, shop.city, shop.country]
    .filter(Boolean)
    .join(", ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeShops(value: unknown): Shop[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((shop) => ({
    companyName: readString(shop.companyName) ?? "Atelier",
    slug: readString(shop.slug) ?? "",
    description: readString(shop.description),
    address: readString(shop.address),
    postalCode: readString(shop.postalCode),
    city: readString(shop.city),
    country: readString(shop.country),
    phone: readString(shop.phone),
    email: readString(shop.email),
    openingHours: readString(shop.openingHours),
    latitude: readNumber(shop.latitude),
    longitude: readNumber(shop.longitude),
    capacityPerDay: readNumber(shop.capacityPerDay) ?? 8,
    activeRepairs: readNumber(shop.activeRepairs) ?? 0,
    isOpenNow: shop.isOpenNow === true,
    availableSlots: Array.isArray(shop.availableSlots)
      ? shop.availableSlots.filter((slot): slot is string => typeof slot === "string")
      : [],
    slotDurationMinutes: readNumber(shop.slotDurationMinutes) ?? 60,
    hasAvailability: shop.hasAvailability === true,
  }));
}

function formatSlot(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ShopLocator() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadShops() {
      try {
        const response = await fetch("/api/public/shops");
        const payload = await response.json();

        if (!ignore) {
          setShops(normalizeShops(payload.shops));
        }
      } catch {
        if (!ignore) {
          setStatus("Recherche des magasins indisponible pour le moment.");
        }
      }
    }

    void loadShops();

    return () => {
      ignore = true;
    };
  }, []);

  const sortedShops = useMemo(() => {
    return [...shops]
      .map((shop) => ({
        shop,
        distance: position ? distanceKm(position, shop) : null,
        isOpenNow: shop.isOpenNow || isShopOpenAt(shop.openingHours),
      }))
      .sort((left, right) => {
        if (left.shop.hasAvailability !== right.shop.hasAvailability) {
          return left.shop.hasAvailability ? -1 : 1;
        }

        if (left.isOpenNow !== right.isOpenNow) {
          return left.isOpenNow ? -1 : 1;
        }

        if (left.distance === null && right.distance === null) {
          return left.shop.companyName.localeCompare(right.shop.companyName);
        }

        if (left.distance === null) {
          return 1;
        }

        if (right.distance === null) {
          return -1;
        }

        return left.distance - right.distance;
      });
  }, [position, shops]);

  const availableShops = sortedShops.filter(
    ({ shop, isOpenNow }) => isOpenNow && shop.hasAvailability,
  );

  function locateUser() {
    setStatus("");

    if (!navigator.geolocation) {
      setStatus("Votre navigateur ne permet pas la localisation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        });
        setStatus("Magasins tries par distance quand les coordonnees sont disponibles.");
      },
      () => setStatus("Localisation refusee ou indisponible."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Trouver un reparateur
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Magasin le plus proche avec de la place
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Activez votre localisation pour classer les boutiques par distance.
            Les boutiques avec de la capacite disponible remontent en premier.
          </p>
        </div>
        <button
          type="button"
          onClick={locateUser}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Navigation aria-hidden="true" className="h-4 w-4" />
          Utiliser ma position
        </button>
      </div>

      {status ? (
        <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {status}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        {availableShops.slice(0, 4).map(({ shop, distance, isOpenNow }) => (
          <article
            key={shop.slug}
            className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto]"
          >
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-950">
                  {shop.companyName}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isOpenNow
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isOpenNow ? "Ouvert maintenant" : "Ferme"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    shop.hasAvailability
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {shop.hasAvailability ? "Place disponible" : "Agenda charge"}
                </span>
                {distance !== null ? (
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                    {distance.toFixed(1).replace(".", ",")} km
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-600">
                {shop.description ||
                  "Atelier Qoravo disponible pour recevoir une demande de devis."}
              </p>
              <div className="grid gap-1 text-sm text-slate-700">
                {addressLabel(shop) ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin aria-hidden="true" className="h-4 w-4 text-sky-600" />
                    {addressLabel(shop)}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <Clock aria-hidden="true" className="h-4 w-4 text-cyan-600" />
                  {todayOpeningLabel(shop.openingHours)}
                </span>
                <span className="text-xs text-slate-500">
                  Semaine : {formatOpeningHours(shop.openingHours)}
                </span>
                {shop.phone ? (
                  <a className="inline-flex items-center gap-2 font-semibold text-slate-950" href={`tel:${shop.phone}`}>
                    <Phone aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                    {shop.phone}
                  </a>
                ) : null}
                {shop.email ? <span>Email : {shop.email}</span> : null}
              </div>
              <div className="mt-2 grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Prochains creneaux
                </p>
                <div className="flex flex-wrap gap-2">
                  {shop.availableSlots.slice(0, 4).map((slot) => (
                    <Link
                      key={slot}
                      href={`/nouvelle-reparation?compte=${shop.slug}&creneau=${encodeURIComponent(slot)}`}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      {formatSlot(slot)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href={`/client/magasins/${shop.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <Send aria-hidden="true" className="h-4 w-4" />
                Voir et envoyer
              </Link>
            </div>
          </article>
        ))}

        {availableShops.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            Aucun magasin ouvert et disponible n&apos;est propose pour le moment.
            Essayez plus tard ou choisissez un autre horaire avec l&apos;atelier.
          </p>
        ) : null}
      </div>
    </section>
  );
}
