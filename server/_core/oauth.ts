import { COOKIE_NAME, REFRESH_COOKIE_NAME, SESSION_TIMEOUT_MS, REFRESH_TOKEN_TIMEOUT_MS } from "@shared/const";
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

      // Create session token with 24-hour expiry (security improvement)
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: SESSION_TIMEOUT_MS,
      });

      // Create refresh token with 30-day expiry
      const refreshToken = await sdk.createRefreshToken(userInfo.openId, {
        expiresInMs: REFRESH_TOKEN_TIMEOUT_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      
      // Set session cookie (24 hours)
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: SESSION_TIMEOUT_MS 
      });
      
      // Set refresh token cookie (30 days, httpOnly for security)
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, { 
        ...cookieOptions, 
        maxAge: REFRESH_TOKEN_TIMEOUT_MS,
        httpOnly: true // Extra security - not accessible via JavaScript
      });

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

  // Refresh token endpoint - allows extending session without re-login
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      if (!refreshToken) {
        res.status(401).json({ error: "No refresh token" });
        return;
      }

      // Verify refresh token and get user info
      const tokenData = await sdk.verifyRefreshToken(refreshToken);
      if (!tokenData) {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }

      // Create new session token
      const newSessionToken = await sdk.createSessionToken(tokenData.openId, {
        name: tokenData.name || "",
        expiresInMs: SESSION_TIMEOUT_MS,
      });

      // Set new session cookie
      res.cookie(COOKIE_NAME, newSessionToken, { 
        ...cookieOptions, 
        maxAge: SESSION_TIMEOUT_MS 
      });

      res.json({ success: true, expiresIn: SESSION_TIMEOUT_MS });
    } catch (error) {
      console.error("[Auth] Refresh failed", error);
      res.status(401).json({ error: "Refresh failed" });
    }
  });
}
