-- Database Indexes Migration
-- Optimizes query performance for high-traffic tables
-- Run this migration to add missing indexes

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(lastActivity);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripeCustomerId);

-- Usage tracking indexes (critical for billing queries)
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON usage_tracking(userId, usageMonth);
CREATE INDEX IF NOT EXISTS idx_usage_action_type ON usage_tracking(actionType);
CREATE INDEX IF NOT EXISTS idx_usage_platform ON usage_tracking(platform);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage_tracking(createdAt);

-- Instagram cache indexes (critical for API performance)
CREATE INDEX IF NOT EXISTS idx_instagram_cache_expires ON instagram_cache(expiresAt);
CREATE INDEX IF NOT EXISTS idx_instagram_cache_updated ON instagram_cache(updatedAt);

-- TikTok cache indexes
CREATE INDEX IF NOT EXISTS idx_tiktok_cache_expires ON tiktok_cache(expiresAt);
CREATE INDEX IF NOT EXISTS idx_tiktok_cache_updated ON tiktok_cache(updatedAt);

-- YouTube cache indexes
CREATE INDEX IF NOT EXISTS idx_youtube_cache_expires ON youtube_cache(expiresAt);
CREATE INDEX IF NOT EXISTS idx_youtube_cache_updated ON youtube_cache(updatedAt);

-- Follower snapshots indexes (critical for growth tracking)
CREATE INDEX IF NOT EXISTS idx_follower_platform_user ON follower_snapshots(platform, username);
CREATE INDEX IF NOT EXISTS idx_follower_date ON follower_snapshots(snapshotDate);
CREATE INDEX IF NOT EXISTS idx_follower_platform_user_date ON follower_snapshots(platform, username, snapshotDate);

-- Saved analyses indexes
CREATE INDEX IF NOT EXISTS idx_saved_user_platform ON saved_analyses(userId, platform);
CREATE INDEX IF NOT EXISTS idx_saved_username ON saved_analyses(username);
CREATE INDEX IF NOT EXISTS idx_saved_favorite ON saved_analyses(userId, isFavorite);
CREATE INDEX IF NOT EXISTS idx_saved_created_at ON saved_analyses(createdAt);

-- Credit transactions indexes
CREATE INDEX IF NOT EXISTS idx_credit_user ON credit_transactions(userId);
CREATE INDEX IF NOT EXISTS idx_credit_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_created_at ON credit_transactions(createdAt);
CREATE INDEX IF NOT EXISTS idx_credit_user_type ON credit_transactions(userId, type);

-- Rate limits indexes (critical for rate limiting performance)
CREATE INDEX IF NOT EXISTS idx_rate_identifier ON rate_limits(identifier, identifierType);
CREATE INDEX IF NOT EXISTS idx_rate_endpoint ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_window ON rate_limits(windowStart);
CREATE INDEX IF NOT EXISTS idx_rate_full ON rate_limits(identifier, identifierType, endpoint);

-- Admin audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(adminId);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_target ON admin_audit_log(targetType, targetId);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(createdAt);

-- Flagged accounts indexes
CREATE INDEX IF NOT EXISTS idx_flagged_user ON flagged_accounts(userId);
CREATE INDEX IF NOT EXISTS idx_flagged_status ON flagged_accounts(status);
CREATE INDEX IF NOT EXISTS idx_flagged_reason ON flagged_accounts(reason);

-- Revenue tracking indexes
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_tracking(date);

-- Referrals indexes
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referrals(referrerId);
CREATE INDEX IF NOT EXISTS idx_referral_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_code ON referrals(referralCode);

-- Referral codes indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(userId);

-- Content plans indexes
CREATE INDEX IF NOT EXISTS idx_content_plans_user ON saved_content_plans(userId);
CREATE INDEX IF NOT EXISTS idx_content_plans_created ON saved_content_plans(createdAt);

-- Analysis notes indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_notes_user ON analysis_notes(userId);
CREATE INDEX IF NOT EXISTS idx_notes_username ON analysis_notes(username);
CREATE INDEX IF NOT EXISTS idx_notes_section ON analysis_notes(sectionId);
CREATE INDEX IF NOT EXISTS idx_notes_user_username ON analysis_notes(userId, username);
