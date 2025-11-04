import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: any) {
  try {
    const data = await resend.emails.send({
      from: "Acme <ExpressPC@resend.dev>",
      to,
      subject,
      html,
    });

    return data;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}
