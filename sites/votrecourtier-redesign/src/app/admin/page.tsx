import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/admin/auth";
import { isBlobConfigured, getDynamicProperties } from "@/lib/admin/blobStore";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return <AdminLogin />;
  }

  const properties = await getDynamicProperties();

  return <AdminDashboard properties={properties} blobConfigured={isBlobConfigured()} />;
}
