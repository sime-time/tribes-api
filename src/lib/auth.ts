import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { CloudflareBindings } from "../config/bindings";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";
import * as authSchema from "../db/schema/auth-schema";

export const auth = (env: CloudflareBindings): ReturnType<typeof betterAuth> => {
  const db = drizzle(env.DB);
  const resend = new Resend(env.RESEND_API_KEY);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: authSchema,
    }),
    trustedOrigins: [env.CLIENT_ORIGIN_URL],
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          await resend.emails.send({
            from: "tribes app <support@webundance.com>",
            to: email,
            subject: "Verify email",
            html: `<strong>CODE: ${otp}</strong>`
          });
        },
      }),
    ],
    advanced: {
      database: {
        // don't use better-auth's default uuid generation
        // because we will use sql-lite's primary key integers
        generateId: false
      },
    },
  })
}
