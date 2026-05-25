"use server";

import { requireRole } from "@/lib/auth/session";
import { createAdminCertSignedUrl } from "./queries";

export async function adminCreateCertSignedUrlAction(filePath: string): Promise<string | null> {
  await requireRole("admin");
  return createAdminCertSignedUrl(filePath);
}
