import { requireCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";

export default async function SettingsPage() {
  const user = await requireCurrentUser();

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Paramètres</h1>
        <p className="text-slate-600 mt-1">{user.email}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-ink">Profil</h2>
        <ProfileForm firstName={user.firstName ?? ""} classe={user.classe ?? ""} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-ink">Mot de passe</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
