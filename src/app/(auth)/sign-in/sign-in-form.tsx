"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/lib/auth-clients";

import { LoadingButton } from "@/app/components/loading-button";
import { PasswordInput } from "@/app/components/password-input";

import { MicrosoftSignInButton } from "@/components/ui/microsoft-signin-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// -----------------------------------------------------
// ✅ Schema de validação
// -----------------------------------------------------
const signInSchema = z.object({
  email: z.email({ message: "Digite um e-mail válido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
  rememberMe: z.boolean().optional(),
});

type SignInValues = z.infer<typeof signInSchema>;

// -----------------------------------------------------
// ✅ Componente principal
// -----------------------------------------------------
export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // -----------------------------------------------------
  // 🔹 LOGIN NORMAL (email + senha)
  // -----------------------------------------------------
  async function onSubmit({ email, password, rememberMe }: SignInValues) {
    try {
      setLoading(true);
      setError(null);

      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error) {
        setError(error.message || "Algo deu errado");
        return;
      }

      toast.success("Login realizado com sucesso!");
      router.push(redirect || "/dashboard");

    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------------
  // 🔹 LOGIN COM MICROSOFT
  // -----------------------------------------------------
  async function handleMicrosoftLogin() {
    try {
      setLoading(true);
      setError(null);

      const { error } = await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(error.message || "Algo deu errado no login Microsoft");
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Entrar</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Insira seus dados para acessar sua conta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* E-mail */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@exemplo.com"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Senha */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Senha</FormLabel>
                    <Link 
                      href="/forgot-password" 
                      className="ml-auto text-sm underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>

                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <FormLabel>Lembrar de mim</FormLabel>
                </FormItem>
              )}
            />

            {/* Erro */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Botão Microsoft */}
            <MicrosoftSignInButton
              onClick={handleMicrosoftLogin}
              className="w-full"
            />

            {/* Botão login normal */}
            <LoadingButton 
              type="submit" 
              className="w-full"
              loading={loading}
            >
              Entrar
            </LoadingButton>

          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-center w-full">
          Não tem uma conta?
          <Link className="underline ml-1" href="/sign-up">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
