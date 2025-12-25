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
  
  const redirectUri = `${origin}/api/oauth/callback${isPopup ? '?popup=true' : ''}`;
  const state = btoa(redirectUri + (isPopup ? '&popup=true' : ''));

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
