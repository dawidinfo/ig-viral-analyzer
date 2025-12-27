/**
 * Google OAuth Service
 * Handles Google Sign-In authentication
 */

import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export interface GoogleOAuthResult {
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
 * Generate a unique openId for Google users
 */
function generateGoogleOpenId(googleId: string): string {
  return `google_${googleId}`;
}

/**
 * Verify Google ID token and get user info
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUser | null> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    
    if (!response.ok) {
      console.error("[GoogleOAuth] Token verification failed:", response.status);
      return null;
    }
    
    const data = await response.json();
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && data.aud !== clientId) {
      console.error("[GoogleOAuth] Token audience mismatch");
      return null;
    }
    
    return {
      id: data.sub,
      email: data.email,
      name: data.name || data.email.split("@")[0],
      picture: data.picture,
      verified_email: data.email_verified === "true",
    };
  } catch (error) {
    console.error("[GoogleOAuth] Error verifying token:", error);
    return null;
  }
}

/**
 * Get user info from Google access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUser | null> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error("[GoogleOAuth] Failed to get user info:", response.status);
      return null;
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email.split("@")[0],
      picture: data.picture,
      verified_email: data.verified_email,
    };
  } catch (error) {
    console.error("[GoogleOAuth] Error getting user info:", error);
    return null;
  }
}

/**
 * Authenticate or create user from Google OAuth
 */
export async function authenticateWithGoogle(
  googleUser: GoogleUser
): Promise<GoogleOAuthResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database unavailable" };
    }
    
    const openId = generateGoogleOpenId(googleUser.id);
    
    // Check if user already exists
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
      
      console.log(`[GoogleOAuth] Existing user logged in: ${googleUser.email}`);
      
      return {
        success: true,
        user: {
          id: existingUser[0].id,
          openId: existingUser[0].openId,
          email: existingUser[0].email || googleUser.email,
          name: existingUser[0].name || googleUser.name,
        },
        isNewUser: false,
      };
    }
    
    // Check if user exists with same email (link accounts)
    const existingEmailUser = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);
    
    if (existingEmailUser.length > 0) {
      await db
        .update(users)
        .set({
          openId: openId,
          loginMethod: "google",
          lastSignedIn: new Date(),
          lastActivity: new Date(),
        })
        .where(eq(users.id, existingEmailUser[0].id));
      
      console.log(`[GoogleOAuth] Linked Google to existing email user: ${googleUser.email}`);
      
      return {
        success: true,
        user: {
          id: existingEmailUser[0].id,
          openId: openId,
          email: googleUser.email,
          name: existingEmailUser[0].name || googleUser.name,
        },
        isNewUser: false,
      };
    }
    
    // Create new user
    await db
      .insert(users)
      .values({
        openId: openId,
        email: googleUser.email,
        name: googleUser.name,
        loginMethod: "google",
        credits: 10,
        plan: "free",
        role: "user",
        status: "active",
        modulesEnabled: ["instagram"],
        createdAt: new Date(),
        lastSignedIn: new Date(),
        lastActivity: new Date(),
      });
    
    console.log(`[GoogleOAuth] New user created: ${googleUser.email}`);
    
    // Get the newly created user
    const [createdUser] = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);
    
    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import("../emailService");
      await sendWelcomeEmail(googleUser.email, googleUser.name);
    } catch (emailError) {
      console.error("[GoogleOAuth] Failed to send welcome email:", emailError);
    }
    
    // Notify admin
    try {
      const { notifyNewSignup } = await import("../emailService");
      await notifyNewSignup(createdUser.id, googleUser.email, googleUser.name);
    } catch (notifyError) {
      console.error("[GoogleOAuth] Failed to notify admin:", notifyError);
    }
    
    return {
      success: true,
      user: {
        id: createdUser.id,
        openId: openId,
        email: googleUser.email,
        name: googleUser.name,
      },
      isNewUser: true,
    };
  } catch (error) {
    console.error("[GoogleOAuth] Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Generate Google OAuth URL for redirect flow
 */
export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID not configured");
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "consent",
    ...(state && { state }),
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; idToken?: string } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error("[GoogleOAuth] Missing client credentials");
    return null;
  }
  
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
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
      console.error("[GoogleOAuth] Token exchange failed:", error);
      return null;
    }
    
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      idToken: data.id_token,
    };
  } catch (error) {
    console.error("[GoogleOAuth] Error exchanging code:", error);
    return null;
  }
}

export default {
  verifyGoogleToken,
  getGoogleUserInfo,
  authenticateWithGoogle,
  getGoogleAuthUrl,
  exchangeGoogleCode,
};
