import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { CloudflareBindings } from "../config/bindings";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";
import { cryptoHash, cryptoVerify } from "./crypto";
import * as authSchema from "../db/schema/auth-schema";

// Helper function to convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer | Uint8Array<ArrayBuffer>) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to convert Hex string to ArrayBuffer
function hexToBuffer(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

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
      password: {
        // better-auth uses scrypt by default which is CPU-intensive
        // and not suitable for serverless environments like Cloudflare Workers
        async hash(password: string) {
          return await cryptoHash(password);
        },
        async verify({ password, hash: storedHash }) {
          return await cryptoVerify(password, storedHash);
        },
      },
    },
    plugins: [
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          await resend.emails.send({
            from: "tribes app <support@webundance.com>",
            to: email,
            subject: "Verify email",
            html: `<strong>CODE: ${otp}</strong>`,
          });
        },
      }),
    ],
    advanced: {
      defaultCookieAttributes: {
        // enable cross-domain cookies (separate frontend and backend)
        sameSite: "none",
        secure: true,
        partitioned: true,
      },
      database: {
        // don't use better-auth's default uuid generation
        // because we will use sql-lite's primary key integers
        generateId: false,
      },
    },
  });
};
