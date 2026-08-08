import type { ReactNode } from "react";
import { ControlConsent } from "./ControlConsent";
import { LocalDataSync } from "./LocalDataSync";
import { ReviewPromptDialog } from "./ReviewPromptDialog";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ControlConsent />
      <LocalDataSync />
      <ReviewPromptDialog />
    </>
  );
}
