export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (options?: { popup?: boolean }) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const isPopup = options?.popup ?? false;
  
  // Always use canonical URL (without www) for OAuth callback
  let origin = window.location.origin;
  if (origin.includes('www.reelspy.ai')) {
    origin = 'https://reelspy.ai';
  }
  
  // IMPORTANT: Do NOT add query parameters to redirectUri
  // The OAuth server appends ?code=...&state=... to the redirectUri
  // Adding ?popup=true would result in ?popup=true?code=... which is invalid
  const redirectUri = `${origin}/api/oauth/callback`;
  
  // Encode popup flag in state instead (will be decoded on callback)
  const stateData = JSON.stringify({ redirectUri, popup: isPopup });
  const state = btoa(stateData);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
