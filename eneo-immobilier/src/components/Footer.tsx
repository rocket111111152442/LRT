import Link from "next/link";
import { nav, company } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-ink px-6 pb-8 pt-16 text-ivory md:px-10 md:pt-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-12 border-b border-ivory/10 pb-14 md:flex-row">
          <p className="font-display text-5xl italic md:text-6xl">énéo</p>

          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] uppercase tracking-widest2 text-ivory/70 transition-colors duration-300 hover:text-ivory"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col justify-between gap-4 pt-8 text-[13px] text-ivory/50 md:flex-row">
          <p>
            {company.name} — {company.address}, {company.city}
          </p>
          <p>
            {company.phone} · {company.email}
          </p>
          <p>&copy; {new Date().getFullYear()} énéo conseil en immobilier SA</p>
        </div>
      </div>
    </footer>
  );
}
