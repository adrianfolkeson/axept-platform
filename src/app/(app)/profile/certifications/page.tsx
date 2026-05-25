import { requireRole } from "@/lib/auth/session";
import { getWorkerProfileByUser } from "@/features/workers/queries";
import { listCertificationsByWorker } from "@/features/certifications/queries";
import { CertificationUploader } from "@/features/certifications/components/CertificationUploader";
import { CertificationList } from "@/features/certifications/components/CertificationList";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

export default async function CertificationsPage() {
  const session = await requireRole("worker");
  const worker = await getWorkerProfileByUser(session.id);
  const certs = worker ? await listCertificationsByWorker(worker.id) : [];

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Certifikat</h1>
        <p className="text-sm text-mute">
          Ladda upp bevis. Filerna lagras privat och visas bara för dig och Axept-admin.
        </p>
      </header>

      <Section title="Mina certifikat">
        <CertificationList rows={certs} />
      </Section>

      <Section title="Lägg till nytt">
        <CertificationUploader workerProfileId={worker?.id ?? null} />
      </Section>
    </div>
  );
}
