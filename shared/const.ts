export const COOKIE_NAME = "app_session_id";
export const REFRESH_COOKIE_NAME = "app_refresh_token";

// Session timeout: 24 hours (was 1 year - security fix)
export const SESSION_TIMEOUT_MS = 1000 * 60 * 60 * 24; // 24 hours

// Refresh token timeout: 30 days
export const REFRESH_TOKEN_TIMEOUT_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// Legacy: Keep for backward compatibility during migration
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Session refresh threshold: refresh if less than 1 hour remaining
export const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60; // 1 hour
