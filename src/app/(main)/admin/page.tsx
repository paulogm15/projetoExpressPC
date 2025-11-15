import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/app/components/user-avatar";
import { User } from "@/lib/auth";
import { getServerSession } from "@/lib/get-session";
import { format } from "date-fns";
import { CalendarDaysIcon, MailIcon, ShieldIcon, UserIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
// Adicionamos 'redirect' para a verificação
import { redirect, unauthorized } from "next/navigation";

export const metadata: Metadata = {
  // Título da página alterado
  title: "Painel Admin",
};

// Função renomeada para AdminPage
export default async function AdminPage() {
  const session = await getServerSession();
  const user = session?.user;

  // 1. Proteção: Garante que o usuário está logado
  if (!user) {
    redirect("/sign-in");
  }

  // 2. Proteção: Garante que a role é "ADMIN"
  // (Lembre-se de verificar se é "ADMIN" ou "admin" no seu banco)
  if (user.role !== "ADMIN") {
  	 unauthorized();
  }

  // 3. Renderiza a página de admin
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          {/* Título alterado */}
          <h1 className="text-2xl font-semibold">Painel do Administrador</h1>
          <p className="text-muted-foreground">
            Olá, {user.name}. Gerencie o sistema aqui.
          </p>
        </div>

        {/* O admin também pode precisar verificar o e-mail */}
        {!user.emailVerified && <EmailVerificationAlert />}

        {/* ▼▼▼ NOVO CARD DE AÇÕES ▼▼▼ */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento</CardTitle>
            <CardDescription>
              Ações disponíveis para o administrador do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Adicione aqui links para as seções de gerenciamento, como:
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {/* Você pode adicionar botões de link reais aqui */}
              <Button variant="outline">Gerenciar Usuários</Button>
              <Button variant="outline">Gerenciar Notebooks</Button>
              <Button variant="outline">Ver Logs</Button>
              <Button asChild variant="outline"><Link href="/admin/turmas">Criar Turmas</Link></Button>

            </div>
          </CardContent>
        </Card>
        {/* ▲▲▲ FIM DO NOVO CARD ▲▲▲ */}

        {/* O admin também pode querer ver o próprio perfil */}
        <ProfileInformation user={user} />
      </div>
    </main>
  );
}

//
// As funções auxiliares (ProfileInformation e EmailVerificationAlert)
// podem permanecer exatamente iguais, pois são reutilizáveis.
//

interface ProfileInformationProps {
  user: User;
}

function ProfileInformation({ user }: ProfileInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="size-5" />
          Informações do Perfil
        </CardTitle>
        <CardDescription>
          Detalhes da sua conta de administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar
              name={user.name}
              image={user.image}
              className="size-32 sm:size-24"
            />
            {user.role && (
              <Badge>
                <ShieldIcon className="size-3" />
                {user.role}
              </Badge>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CalendarDaysIcon className="size-4" />
                Membro desde
              </div>
              <p className="font-medium">
                {format(user.createdAt, "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailVerificationAlert() {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/50 dark:bg-yellow-950/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MailIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-yellow-800 dark:text-yellow-200">
            Verifique seu endereço de e-mail para acessar todos os recursos.
          </span>
        </div>

        {/* ▼▼▼ CORREÇÃO APLICADA AQUI ▼▼▼ */}
        {/* O <Link> deve vir imediatamente após a tag de abertura do <Button> */}
        <Button size="sm" asChild><Link href="/verify-email">Verificar e-mail</Link></Button>
        {/* ▲▲▲ FIM DA CORREÇÃO ▲▲▲ */}
      </div>
    </div>
  );
}