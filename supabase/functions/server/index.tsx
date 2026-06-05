import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5a760dac/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth endpoints
app.post("/make-server-5a760dac/auth/check-session", async (c) => {
  try {
    const { deviceId } = await c.req.json();
    if (!deviceId) {
      return c.json({ user: null });
    }

    const session = await kv.get(`device_session:${deviceId}`);

    if (session && session.expiresAt > Date.now()) {
      return c.json({ user: session });
    }

    // Session expired or doesn't exist
    return c.json({ user: null });
  } catch (error) {
    console.log('[Auth] Check session error:', error);
    return c.json({ user: null });
  }
});

app.post("/make-server-5a760dac/auth/login", async (c) => {
  try {
    const { email, password, rememberMe, deviceId } = await c.req.json();

    // Get all users
    let users = await kv.get('aqms_users') || [];

    // AUTO-FIX: Check if qa@aqms.com has wrong role and fix it
    const qaUser = users.find((u: any) => u.email === 'qa@aqms.com');
    if (qaUser && qaUser.role !== 'Administrator') {
      console.log('[Auth] Detected qa@aqms.com with wrong role, fixing...');
      qaUser.role = 'Administrator';
      qaUser.organizationName = 'AQMS Demo Organization';
      qaUser.title = 'Head of QA / Administrator';
      qaUser.canSignOffQA = true;
      qaUser.canSignOffPM = true;
      await kv.set('aqms_users', users);
      console.log('[Auth] Fixed qa@aqms.com role to Administrator');
    }

    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Create session data stored by device ID
    const sessionData = {
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      createdAt: Date.now(),
      expiresAt: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000)
    };

    // Store session in database keyed by device ID
    await kv.set(`device_session:${deviceId}`, sessionData);

    return c.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organizationName
      }
    });
  } catch (error) {
    console.log('[Auth] Login error:', error);
    return c.json({ success: false, error: 'Server error' }, 500);
  }
});

app.post("/make-server-5a760dac/auth/logout", async (c) => {
  try {
    const { deviceId } = await c.req.json();
    if (deviceId) {
      await kv.del(`device_session:${deviceId}`);
    }
    return c.json({ success: true });
  } catch (error) {
    console.log('[Auth] Logout error:', error);
    return c.json({ success: false, error: 'Server error' }, 500);
  }
});

// Data endpoints
app.get("/make-server-5a760dac/data/:key", async (c) => {
  try {
    const key = c.req.param('key');
    const data = await kv.get(key);
    return c.json({ data });
  } catch (error) {
    console.log(`[Data] Get ${c.req.param('key')} error:`, error);
    return c.json({ data: null, error: error.message }, 500);
  }
});

app.post("/make-server-5a760dac/data/:key", async (c) => {
  try {
    const key = c.req.param('key');
    const { data } = await c.req.json();
    await kv.set(key, data);
    return c.json({ success: true });
  } catch (error) {
    console.log(`[Data] Set ${c.req.param('key')} error:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);