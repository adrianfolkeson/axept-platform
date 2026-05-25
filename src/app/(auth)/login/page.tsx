import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Logga in — Axept" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Logga in</h1>
        <p className="text-sm text-mute">Välkommen tillbaka.</p>
      </div>
      <LoginForm />
    </div>
  );
}
