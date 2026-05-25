import Link from "next/link";
import type { SessionProfile } from "@/lib/auth/session";
import { RequestForm } from "./RequestForm";

interface Props {
  session: SessionProfile;
  targetType: "worker" | "equipment";
  targetId: string;
  targetUserId: string;
}

/** Renders the request form (or a notice) on a marketplace detail page. */
export function RequestCTA({ session, targetType, targetId, targetUserId }: Props) {
  if (session.id === targetUserId) {
    return (
      <p className="text-sm text-mute">
        Detta är din egen annons.{" "}
        {targetType === "equipment" && (
          <Link href="/profile/equipment" className="text-accent hover:underline">
            Hantera under Mina maskiner.
          </Link>
        )}
      </p>
    );
  }

  return <RequestForm targetType={targetType} targetId={targetId} />;
}
