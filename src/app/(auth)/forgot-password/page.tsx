import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueceu a senha",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="space-y-6 w-full">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Esqueceu a senha</h1>
          <p className="text-muted-foreground">
            Informe seu endereço de e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
