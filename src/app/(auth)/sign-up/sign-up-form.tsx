"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { LoadingButton } from "@/app/components/loading-button";
import { PasswordInput } from "@/app/components/password-input";
import { authClient } from "@/lib/auth-clients";
import { passwordSchema } from "@/lib/validation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


// ✅ SCHEMA DE VALIDAÇÃO
const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "Digite um e-mail válido" }),
    role: z.enum(["ADMIN", "PROFESSOR"]).refine((val) => !!val, {
      message: "Selecione o tipo de conta",
    }),
    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(1, { message: "Confirme sua senha" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;


// ✅ COMPONENTE DE CADASTRO
export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "PROFESSOR", // valor padrão
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit({ email, password, name, role }: SignUpValues) {
    setError(null);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      role, // inclui o tipo de conta
      callbackURL: "/email-verified",
    });

    if (error) {
      setError(error.message || "Algo deu errado");
    } else {
      toast.success("Conta criada com sucesso!");
      router.push("/sign-in");
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Cadastro</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Insira suas informações para criar uma conta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Conta */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de conta</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ADMIN" />
                        </FormControl>
                        <FormLabel className="font-normal">Admin</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="PROFESSOR" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Professor
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Digite sua senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmar Senha */}
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Confirme sua senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Erros */}
            {error && (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            )}

            <LoadingButton type="submit" className="w-full" loading={loading}>
              Criar conta
            </LoadingButton>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <div className="flex w-full justify-center border-t pt-4">
          <p className="text-muted-foreground text-center text-xs">
            Já possui uma conta?{" "}
            <Link href="/sign-in" className="underline">
              Entrar
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
