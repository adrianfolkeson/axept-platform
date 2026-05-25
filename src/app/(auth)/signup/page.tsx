import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata = { title: "Skapa konto — Axept" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Skapa konto</h1>
        <p className="text-sm text-mute">Kom igång på Axept på under en minut.</p>
      </div>
      <SignupForm />
    </div>
  );
}
