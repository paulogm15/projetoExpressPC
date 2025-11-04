import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendEmail } from "./email";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { passwordSchema } from "./validation";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true quer dizer que o usuário só pode fazer login depois de confirmar o e-mail
    requireEmailVerification: false, 

    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Redefina sua senha",
        html: `
          <p>Você solicitou a redefinição de senha.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <a href="${url}">${url}</a>
        `,
      });
    },
  },

  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,

    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Verifique seu e-mail",
        html: `
          <p>Bem-vindo!</p>
          <p>Clique no link abaixo para confirmar seu e-mail:</p>
          <a href="${url}">${url}</a>
        `,
      });
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body?.password || ctx.body?.newPassword;
        const { error } = passwordSchema.safeParse(password);

        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: "A senha não é forte o suficiente",
          });
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
