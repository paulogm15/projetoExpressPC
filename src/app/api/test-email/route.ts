import { sendEmail } from "@/lib/email";

export async function GET() {
  await sendEmail({
    to: "",
    subject: "",
    html: "<h1>Funcionou 🎉</h1>",
  });

  return Response.json({ message: "Email enviado!" });
}
