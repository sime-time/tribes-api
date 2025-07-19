import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { CloudflareBindings } from "./config/bindings";
import habitRoute from "./routes/habit-route";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// cors middleware
app.use('*', async (c, next) => {
  const originUrl = c.env.CLIENT_ORIGIN_URL;
  const corsMiddleware = cors({
    origin: originUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// catch-all route for better-auth
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth(c.env).handler(c.req.raw);
});

// habit route
app.route("/api/habit", habitRoute)

app.get("/", (c) => {
  return c.text("Hello Hono");
});

app.get("/api/health", (c) => {
  return c.json({ success: c.env.CLIENT_ORIGIN_URL })
});

export default app;
