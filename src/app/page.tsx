import { redirect } from "next/navigation";

export default function Home() {
  // Redireciona incondicionalmente
  redirect("/sign-in");
}
/*
import axios from "axios";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function Home() {
  const incomingHeaders = await headers(); 
  const headersObj: Record<string, string> = {};

  incomingHeaders.forEach((value, key) => {
    headersObj[key] = value;
  });

  try {
    // Tenta validar a sessão do usuário
    await axios.get(`${process.env.API_URL}/sign-in`, { // (Geralmente esse endpoint seria /api/me ou /api/session)
      headers: headersObj,
    });

    // SUCESSO: O usuário está logado.
    // Você DEVE retornar o JSX da página aqui.
    return (
      <main>
        <h1>Página Inicial</h1>
        <p>Bem-vindo, você está logado!</p>
      </main>
    );

  } catch (error) {
    // ERRO: O usuário não está logado (API retornou 401, 403, etc.)
    // O Axios joga um erro em status 4xx/5xx, então o redirect funciona.
    redirect("/sign-in");
  }
}
*/