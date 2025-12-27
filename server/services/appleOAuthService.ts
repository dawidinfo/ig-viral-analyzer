/**
 * Apple OAuth Service
 * Handles Sign in with Apple authentication
 */

import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export interface AppleUser {
  id: string;
  email?: string;
  name?: string;
}

export interface AppleOAuthResult {
  success: boolean;
  user?: {
    id: number;
    openId: string;
    email: string;
    name: string;
  };
  isNewUser?: boolean;
  error?: string;
}

/**
 * Generate a unique openId for Apple users
 */
function generateAppleOpenId(appleId: string): string {
  return `apple_${appleId}`;
}

/**
 * Verify Apple ID token
 */
export async function verifyAppleToken(idToken: string): Promise<AppleUser | null> {
  try {
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded) {
      console.error("[AppleOAuth] Failed to decode token");
      return null;
    }
    
    const keysResponse = await fetch("https://appleid.apple.com/auth/keys");
    if (!keysResponse.ok) {
      console.error("[AppleOAuth] Failed to fetch Apple keys");
      return null;
    }
    
    const keys = await keysResponse.json();
    const key = keys.keys.find((k: any) => k.kid === decoded.header.kid);
    
    if (!key) {
      console.error("[AppleOAuth] Key not found");
      return null;
    }
    
    const payload = decoded.payload as any;
    
    if (payload.iss !== "https://appleid.apple.com") {
      console.error("[AppleOAuth] Invalid issuer");
      return null;
    }
    
    const clientId = process.env.APPLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      console.error("[AppleOAuth] Invalid audience");
      return null;
    }
    
    return {
      id: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    console.error("[AppleOAuth] Error verifying token:", error);
    return null;
  }
}

/**
 * Authenticate or create user from Apple OAuth
 */
export async function authenticateWithApple(
  appleUser: AppleUser,
  providedName?: string
): Promise<AppleOAuthResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database unavailable" };
    }
    
    const openId = generateAppleOpenId(appleUser.id);
    
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);
    
    if (existingUser.length > 0) {
      await db
        .update(users)
        .set({
          lastSignedIn: new Date(),
          lastActivity: new Date(),
        })
        .where(eq(users.id, existingUser[0].id));
      
      console.log(`[AppleOAuth] Existing user logged in: ${existingUser[0].email}`);
      
      return {
        success: true,
        user: {
          id: existingUser[0].id,
          openId: existingUser[0].openId,
          email: existingUser[0].email || appleUser.email || "",
          name: existingUser[0].name || providedName || "",
        },
        isNewUser: false,
      };
    }
    
    if (appleUser.email) {
      const existingEmailUser = await db
        .select()
        .from(users)
        .where(eq(users.email, appleUser.email))
        .limit(1);
      
      if (existingEmailUser.length > 0) {
        await db
          .update(users)
          .set({
            openId: openId,
            loginMethod: "apple",
            lastSignedIn: new Date(),
            lastActivity: new Date(),
          })
          .where(eq(users.id, existingEmailUser[0].id));
        
        console.log(`[AppleOAuth] Linked Apple to existing email user: ${appleUser.email}`);
        
        return {
          success: true,
          user: {
            id: existingEmailUser[0].id,
            openId: openId,
            email: appleUser.email,
            name: existingEmailUser[0].name || providedName || "",
          },
          isNewUser: false,
        };
      }
    }
    
    const userName = providedName || appleUser.name || (appleUser.email ? appleUser.email.split("@")[0] : "Apple User");
    
    await db
      .insert(users)
      .values({
        openId: openId,
        email: appleUser.email || null,
        name: userName,
        loginMethod: "apple",
        credits: 10,
        plan: "free",
        role: "user",
        status: "active",
        modulesEnabled: ["instagram"],
        createdAt: new Date(),
        lastSignedIn: new Date(),
        lastActivity: new Date(),
      });
    
    console.log(`[AppleOAuth] New user created: ${appleUser.email || appleUser.id}`);
    
    const [createdUser] = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);
    
    if (appleUser.email) {
      try {
        const { sendWelcomeEmail } = await import("../emailService");
        await sendWelcomeEmail(appleUser.email, userName);
      } catch (emailError) {
        console.error("[AppleOAuth] Failed to send welcome email:", emailError);
      }
      
      try {
        const { notifyNewSignup } = await import("../emailService");
        await notifyNewSignup(createdUser.id, appleUser.email, userName);
      } catch (notifyError) {
        console.error("[AppleOAuth] Failed to notify admin:", notifyError);
      }
    }
    
    return {
      success: true,
      user: {
        id: createdUser.id,
        openId: openId,
        email: appleUser.email || "",
        name: userName,
      },
      isNewUser: true,
    };
  } catch (error) {
    console.error("[AppleOAuth] Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Generate Apple OAuth URL for redirect flow
 */
export function getAppleAuthUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("APPLE_CLIENT_ID not configured");
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code id_token",
    response_mode: "form_post",
    scope: "name email",
    ...(state && { state }),
  });
  
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

/**
 * Generate client secret for Apple OAuth
 */
export function generateAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_CLIENT_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;
  
  if (!teamId || !clientId || !keyId || !privateKey) {
    throw new Error("Apple OAuth credentials not configured");
  }
  
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 86400 * 180,
    aud: "https://appleid.apple.com",
    sub: clientId,
  };
  
  return jwt.sign(payload, privateKey.replace(/\\n/g, "\n"), {
    algorithm: "ES256",
    header: {
      alg: "ES256",
      kid: keyId,
    },
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeAppleCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; idToken?: string } | null> {
  const clientId = process.env.APPLE_CLIENT_ID;
  
  if (!clientId) {
    console.error("[AppleOAuth] Missing client credentials");
    return null;
  }
  
  try {
    const clientSecret = generateAppleClientSecret();
    
    const response = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("[AppleOAuth] Token exchange failed:", error);
      return null;
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      idToken: data.id_token,
    };
  } catch (error) {
    console.error("[AppleOAuth] Error exchanging code:", error);
    return null;
  }
}

export default {
  verifyAppleToken,
  authenticateWithApple,
  getAppleAuthUrl,
  exchangeAppleCode,
};
