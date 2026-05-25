import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/features/profiles/queries";
import { getCompanyByOwner } from "@/features/companies/queries";
import { getWorkerProfileByUser } from "@/features/workers/queries";
import { ProfileForm } from "@/features/profiles/components/ProfileForm";
import { AvatarUploader } from "@/features/profiles/components/AvatarUploader";
import { CompanyForm } from "@/features/companies/components/CompanyForm";
import { WorkerProfileForm } from "@/features/workers/components/WorkerProfileForm";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser();
  const profile = await getProfile(session.id);
  if (!profile) redirect("/login");

  const [company, worker] = await Promise.all([
    profile.role === "company" ? getCompanyByOwner(session.id) : Promise.resolve(null),
    profile.role === "worker" ? getWorkerProfileByUser(session.id) : Promise.resolve(null)
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Min profil</h1>
        <p className="text-sm text-mute">
          Håll uppgifterna aktuella — de visas på marknadsplatsen.
        </p>
      </header>

      <Section title="Profilbild">
        <AvatarUploader userId={session.id} avatarUrl={profile.avatar_url} />
      </Section>

      <Section title="Personuppgifter" description="Synliga för andra på marknadsplatsen.">
        <ProfileForm profile={profile} />
      </Section>

      {profile.role === "company" && (
        <Section
          title="Företagsuppgifter"
          description="Visas på företagets profilsida."
        >
          <CompanyForm company={company} />
        </Section>
      )}

      {profile.role === "worker" && (
        <Section
          title="Arbetarprofil"
          description="Synlig för byggföretag som söker arbetare."
        >
          <WorkerProfileForm worker={worker} />
        </Section>
      )}

      {profile.role === "equipment_owner" && (
        <Section
          title="Mina maskiner"
          description="Hantera dina maskinannonser under sidan ”Mina maskiner”."
        >
          <a
            href="/profile/equipment"
            className="inline-flex h-10 items-center rounded-md border border-border bg-bg px-4 text-sm font-medium hover:bg-panel"
          >
            Gå till mina maskiner →
          </a>
        </Section>
      )}
    </div>
  );
}
