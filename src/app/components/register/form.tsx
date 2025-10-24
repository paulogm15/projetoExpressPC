"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import axios, { AxiosError } from "axios";
import { RegisterResponse } from "@/app/api/register/route";
import { useRef, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoaderPinwheel } from "lucide-react";

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const password2InputRef = useRef<HTMLInputElement>(null);

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleRegisterSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError("");
      setFormLoading(true);

      const emailReg = new RegExp(
        "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
      );

      if (emailInputRef.current && passwordInputRef.current && password2InputRef.current) {
        const email = emailInputRef.current.value;
        const password = passwordInputRef.current.value;
        const password2 = password2InputRef.current.value;

        let shouldReturnError = false;

        if (!emailReg.test(email)) {
          setFormError("Digite um e-mail válido.");
          shouldReturnError = true;
        }

        if (password.length < 8) {
          setFormError("A senha deve ter pelo menos 8 caracteres.");
          shouldReturnError = true;
        }
        if (password !== password2) {
          setFormError("As senhas não são iguais.");
          shouldReturnError = true;
        }

        if (shouldReturnError) {
          setFormLoading(false);
          setFormSuccess(false);
          return;
        }

        try {
        const response = await axios.post<RegisterResponse>("/api/register", {

            email,
            password,
            password2,
          });
          console.log(response.data);
        } catch (error) {
          if (error instanceof AxiosError) {
            const  { error: errorMessage }=error.response?.data as RegisterResponse;
           if (errorMessage?.toLowerCase().includes("user already exist")) {
           setFormError("Esse e-mail já está registrado. Tente ir para login.");
           } else {
           setFormError(errorMessage || error.message);
         }

          }
            setFormLoading(false);
            setFormSuccess(false);
        }
      }
    },
    []
  );

  return (
    <form onSubmit={(event) => handleRegisterSubmit(event)}>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Bem-vindo</h1>
                  <p className="text-muted-foreground text-balance">
                    Insira seus dados para se cadastrar
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    
                  </div>
                  <Input ref={passwordInputRef} id="password" type="password" required />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password2">Repita a senha</FieldLabel>
                  </div>
                  <Input ref={password2InputRef} id="password2" type="password" required />
                </Field>

                <CardFooter className="grid">
                  {formError && (
                    <div className="text-amber-600 my-4">
                      <p className="text-sm font-semibold">Error no formulário!</p>
                      <p>{formError}</p>
                    </div>
                  )}
                </CardFooter>


                 <CardFooter className="grid">
                  {formSuccess && (
                    <div className="text-green-100 my-4">
                      <p className="text-sm font-semibold">formulário enviador</p>
                      <p>{formSuccess}</p>
                    </div>
                  )}


                </CardFooter>
                {formSuccess && (
                   <div className="text-red-600 my-4">
                      <p className="text-sm font-semibold">formulário Cadastrado</p>
                      <p>{formSuccess}</p>
                    </div>
                )}

                <Button 
                className="w-full fle items-center gap-2"
                 disabled={formLoading} 
                 >
                    Cadastro
                 </Button>
                 {formLoading&& <LoaderPinwheel className="w-[18px] animate-spin" />}

              </FieldGroup>
            </div>


             <Link href="/login" className="text-blue-600 hover:underline">
             Ir para o login
            </Link>


          </CardContent>
        </Card>

        <FieldDescription className="px-6 text-center">
          Ao clicar em continuar, você concorda com{" "}
          <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.
        </FieldDescription>
      </div>
    </form>
  );
}
