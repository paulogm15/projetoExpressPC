<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
"use client";

import { authClient } from "@/lib/auth-clients";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface MicrosoftSignInButtonProps {
  onClick?: () => void;
  className?: string;
}

export function MicrosoftSignInButton({
  onClick,
  className,
}: MicrosoftSignInButtonProps) {
  
  // Ação padrão caso nenhum onClick seja enviado
  const defaultMicrosoftLogin = async () => {
    await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: "/dashboard",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick ?? defaultMicrosoftLogin}
      className={`w-full flex items-center gap-3 ${className}`}
    >
      <Image
        src="/icons/Microsoft_logo.svg"
        alt="Microsoft Logo"
        width={22}
        height={22}
      />

      <span className="text-gray-700 font-medium">
        Continuar com Microsoft
      </span>
    </Button>
  );
}
<<<<<<< HEAD

=======
=======
"use client";

import { authClient } from "@/lib/auth-clients";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface MicrosoftSignInButtonProps {
  onClick?: () => void;
  className?: string;
}

export function MicrosoftSignInButton({
  onClick,
  className,
}: MicrosoftSignInButtonProps) {
  
  // Ação padrão caso nenhum onClick seja enviado
  const defaultMicrosoftLogin = async () => {
    await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: "/dashboard",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick ?? defaultMicrosoftLogin}
      className={`w-full flex items-center gap-3 ${className}`}
    >
      <Image
        src="/icons/Microsoft_logo.svg"
        alt="Microsoft Logo"
        width={22}
        height={22}
      />

      <span className="text-gray-700 font-medium">
        Continuar com Microsoft
      </span>
    </Button>
  );
}
>>>>>>> origin/main
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
