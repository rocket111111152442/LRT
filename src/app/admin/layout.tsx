import type { ReactNode } from "react";
import { ControlConsent } from "./ControlConsent";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ControlConsent />
    </>
  );
}
