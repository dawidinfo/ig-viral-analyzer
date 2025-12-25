import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Check if this is a popup login (decode state to check popup flag)
      let isPopup = false;
      try {
        const stateData = JSON.parse(atob(state));
        isPopup = stateData.popup === true;
      } catch {
        // Fallback for old state format
        isPopup = state.includes('popup') || req.query.popup === 'true';
      }
      
      if (isPopup) {
        // Return HTML that sends message to parent window and closes
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Login erfolgreich</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                }
                .container {
                  text-align: center;
                  padding: 2rem;
                }
                .success-icon {
                  font-size: 4rem;
                  margin-bottom: 1rem;
                }
                h1 {
                  font-size: 1.5rem;
                  margin-bottom: 0.5rem;
                }
                p {
                  color: #a0a0a0;
                  font-size: 0.9rem;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success-icon">✅</div>
                <h1>Login erfolgreich!</h1>
                <p>Dieses Fenster schließt sich automatisch...</p>
              </div>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'oauth-success' }, window.location.origin);
                  setTimeout(() => window.close(), 1500);
                } else {
                  window.location.href = '/dashboard';
                }
              </script>
            </body>
          </html>
        `);
      } else {
        res.redirect(302, "/dashboard");
      }
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
