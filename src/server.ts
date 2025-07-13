import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { CloudflareBindings } from "./config/bindings";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// middleware
app.use(
  "*",
  cors({
    origin: "https://tribes-pwa.pages.dev",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// catch-all route for better-auth handler
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth(c.env).handler(c.req.raw);
});

app.get("/", (c) => {
  return c.text("Hello Hono");
});

app.get("/api/health", (c) => {
  return c.json({ success: c.env.CLIENT_ORIGIN_URL })
});

export default app;
