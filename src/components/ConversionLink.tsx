"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

export function ConversionLink({
  href,
  eventName,
  location,
  className,
  children,
}: {
  href: string;
  eventName: string;
  location: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track(eventName, { location, destination: href })}
    >
      {children}
    </Link>
  );
}
