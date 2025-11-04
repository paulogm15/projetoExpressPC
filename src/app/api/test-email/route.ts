import { sendEmail } from "@/lib/email";

export async function GET() {
  await sendEmail({
    to: "seuemail@gmail.com",
    subject: "Teste Resend Dev Mode",
    html: "<h1>Funcionou 🎉</h1>",
  });

  return Response.json({ message: "Email enviado!" });
}
