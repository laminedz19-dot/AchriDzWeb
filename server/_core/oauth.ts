import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const GOOGLE_STATE_COOKIE = "google_oauth_state";

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth is not configured: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL",
    );
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

function stateCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60 * 1000,
  };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/google", (_req: Request, res: Response) => {
    try {
      const client = getGoogleClient();
      const state = crypto.randomBytes(32).toString("hex");

      res.cookie(GOOGLE_STATE_COOKIE, state, stateCookieOptions());
      res.redirect(
        302,
        client.generateAuthUrl({
          access_type: "online",
          scope: ["openid", "email", "profile"],
          state,
          prompt: "select_account",
        }),
      );
    } catch (error) {
      console.error("[Google OAuth] Start failed", error);
      res.status(500).json({ error: "Google OAuth is not configured" });
    }
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const expectedState = cookies[GOOGLE_STATE_COOKIE];

    if (!code || !state || !expectedState || state !== expectedState) {
      res.status(400).json({ error: "Invalid Google OAuth state or code" });
      return;
    }

    res.clearCookie(GOOGLE_STATE_COOKIE, {
      ...stateCookieOptions(),
      maxAge: 0,
    });

    try {
      const client = getGoogleClient();
      const { tokens } = await client.getToken(code);

      if (!tokens.id_token) {
        res.status(400).json({ error: "Google did not return an ID token" });
        return;
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        res.status(403).json({ error: "A verified Google email is required" });
        return;
      }

      const openId = `google:${payload.sub}`;
      const name = payload.name || payload.email;

      await db.upsertUser({
        openId,
        name,
        email: payload.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);

      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });
}

export const googleOAuthStateCookie = GOOGLE_STATE_COOKIE;
export const googleOAuthStateCookieOptions = stateCookieOptions;
