import type { ReactNode } from "react";
import { ControlConsent } from "./ControlConsent";
import { LocalDataSync } from "./LocalDataSync";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ControlConsent />
      <LocalDataSync />
    </>
  );
}
