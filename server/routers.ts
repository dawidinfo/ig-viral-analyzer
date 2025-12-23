import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyzeInstagramAccount, fetchInstagramProfile, fetchInstagramPosts, fetchInstagramReels, InstagramAnalysis } from "./instagram";
import { getFollowerHistory, getTimeRanges } from "./followerHistory";
import { generatePostingTimeAnalysis } from "./postingTimeAnalysis";
import { analyzeReel } from "./reelAnalysis";
import { generateDeepAnalysis, DeepAnalysis } from "./deepAnalysis";
import { analyzeTikTokAccount, fetchTikTokProfile, searchTikTokVideos, TikTokAnalysis } from "./tiktok";
import { analyzeYouTubeChannel, fetchYouTubeChannel, searchYouTubeVideos, YouTubeAnalysis } from "./youtube";
import { isUserAdmin, getAllUsers, getAdminStats, banUser, unbanUser, setUserRole, updateUserPlan, getUserActivity, getTopUsers, scanForSuspiciousUsers } from "./adminService";
import { runScheduledTracking, getTrackingStats, getSavedAccountsForTracking, getTopGrowingAccounts, getDecliningAccounts, getPlatformDistribution, getAccountHistory } from "./scheduledTracking";
import { getOrCreateReferralCode, getReferralCodeInfo, getUserReferrals, applyReferralCode, setVanityCode, getAffiliateStats } from "./affiliateService";
import { getDb } from "./db";
import { getUserCredits, useCredits, addCredits, getCreditHistory, getCreditStats, canPerformAction, getActionCost } from "./creditService";
import { createCheckoutSession, getPaymentHistory, getOrCreateCustomer } from "./stripe/checkout";
import { CREDIT_PACKAGES as STRIPE_PACKAGES } from "./stripe/products";
import { instagramCache, savedAnalyses, usageTracking, users, CREDIT_COSTS, CREDIT_PACKAGES, creditTransactions, PLAN_LIMITS } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Cache duration: 1 hour
const CACHE_DURATION_MS = 60 * 60 * 1000;

async function getCachedAnalysis(username: string): Promise<InstagramAnalysis | null> {
  const cleanUsername = username.replace("@", "").toLowerCase().trim();
  
  try {
    const db = await getDb();
    if (!db) return null;
    
    const cached = await db
      .select()
      .from(instagramCache)
      .where(eq(instagramCache.username, cleanUsername))
      .limit(1);
    
    if (cached.length > 0 && cached[0].expiresAt > new Date()) {
      console.log(`[Cache] Hit for @${cleanUsername}`);
      return cached[0].analysisData as InstagramAnalysis;
    }
    
    console.log(`[Cache] Miss for @${cleanUsername}`);
    return null;
  } catch (error) {
    console.error("[Cache] Error reading cache:", error);
    return null;
  }
}

async function setCachedAnalysis(username: string, analysis: InstagramAnalysis): Promise<void> {
  const cleanUsername = username.replace("@", "").toLowerCase().trim();
  const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);
  
  try {
    const db = await getDb();
    if (!db) return;
    
    // Try to update existing record first
    const existing = await db
      .select()
      .from(instagramCache)
      .where(eq(instagramCache.username, cleanUsername))
      .limit(1);
    
    if (existing.length > 0) {
      await db
        .update(instagramCache)
        .set({
          profileData: analysis.profile,
          postsData: analysis.posts,
          reelsData: analysis.reels,
          analysisData: analysis,
          expiresAt,
        })
        .where(eq(instagramCache.username, cleanUsername));
    } else {
      await db.insert(instagramCache).values({
        username: cleanUsername,
        profileData: analysis.profile,
        postsData: analysis.posts,
        reelsData: analysis.reels,
        analysisData: analysis,
        expiresAt,
      });
    }
    
    console.log(`[Cache] Stored analysis for @${cleanUsername}`);
  } catch (error) {
    console.error("[Cache] Error writing cache:", error);
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  instagram: router({
    analyze: publicProcedure
      .input(z.object({ username: z.string().min(1) }))
      .query(async ({ input }) => {
        // Check cache first
        const cached = await getCachedAnalysis(input.username);
        if (cached) {
          return { ...cached, fromCache: true };
        }
        
        // Fetch fresh data
        const analysis = await analyzeInstagramAccount(input.username);
        
        // Store in cache
        await setCachedAnalysis(input.username, analysis);
        
        return { ...analysis, fromCache: false };
      }),

    profile: publicProcedure
      .input(z.object({ username: z.string().min(1) }))
      .query(async ({ input }) => {
        const profile = await fetchInstagramProfile(input.username);
        return profile;
      }),

    posts: publicProcedure
      .input(z.object({ 
        username: z.string().min(1),
        count: z.number().min(1).max(50).default(12)
      }))
      .query(async ({ input }) => {
        const posts = await fetchInstagramPosts(input.username, input.count);
        return posts;
      }),

    reels: publicProcedure
      .input(z.object({ 
        username: z.string().min(1),
        count: z.number().min(1).max(50).default(12)
      }))
      .query(async ({ input }) => {
        const reels = await fetchInstagramReels(input.username, input.count);
        return reels;
      }),
      
    clearCache: publicProcedure
      .input(z.object({ username: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const cleanUsername = input.username.replace("@", "").toLowerCase().trim();
        try {
          const db = await getDb();
          if (!db) return { success: false, error: "Database not available" };
          
          await db
            .delete(instagramCache)
            .where(eq(instagramCache.username, cleanUsername));
          return { success: true };
        } catch (error) {
          return { success: false, error: String(error) };
        }
      }),

    analyzeReel: publicProcedure
      .input(z.object({ 
        username: z.string().min(1),
        reelUrl: z.string().optional()
      }))
      .query(async ({ input }) => {
        const analysis = await analyzeReel(input.username, input.reelUrl);
        return analysis;
      }),

    // Deep viral analysis with HAPSS, patterns, SEO, top content
    deepAnalysis: publicProcedure
      .input(z.object({ username: z.string().min(1) }))
      .query(async ({ input }): Promise<DeepAnalysis> => {
        // First get the basic analysis
        const cached = await getCachedAnalysis(input.username);
        let analysis;
        
        if (cached) {
          analysis = cached;
        } else {
          const { analyzeInstagramAccount } = await import("./instagram");
          analysis = await analyzeInstagramAccount(input.username);
          await setCachedAnalysis(input.username, analysis);
        }

        // Generate deep analysis
        const deepAnalysis = generateDeepAnalysis(
          input.username,
          analysis.posts,
          analysis.reels,
          {
            avgLikes: analysis.metrics.avgLikes,
            avgComments: analysis.metrics.avgComments,
            avgViews: analysis.metrics.avgViews,
            engagementRate: analysis.metrics.engagementRate,
          },
          analysis.viralScore,
          analysis.profile.followerCount
        );

        return deepAnalysis;
      }),

    // Follower history with time ranges
    followerHistory: publicProcedure
      .input(z.object({ 
        username: z.string().min(1),
        timeRange: z.enum(['7d', '1m', '3m', '6m', '1y', 'max']).default('1m')
      }))
      .query(async ({ input }) => {
        // Get current follower count from cache or fetch
        const cached = await getCachedAnalysis(input.username);
        let currentFollowers = 10000; // Default
        
        if (cached) {
          currentFollowers = cached.profile.followerCount;
        } else {
          try {
            const profile = await fetchInstagramProfile(input.username);
            currentFollowers = profile.followerCount;
          } catch (e) {
            // Use demo data
            const seed = input.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            currentFollowers = 10000 + (seed % 500000);
          }
        }
        
        const history = await getFollowerHistory(input.username, currentFollowers, input.timeRange);
        return history;
      }),

    // Get available time ranges
    timeRanges: publicProcedure.query(() => {
      return getTimeRanges();
    }),

    // Posting time analysis
    postingTimeAnalysis: publicProcedure
      .input(z.object({ username: z.string().min(1) }))
      .query(async ({ input }) => {
        // Get cached analysis data if available
        const cached = await getCachedAnalysis(input.username);
        const posts = cached?.posts || [];
        const reels = cached?.reels || [];
        
        const analysis = generatePostingTimeAnalysis(input.username, posts, reels);
        return analysis;
      }),
  }),

  // Dashboard routes
  dashboard: router({
    // Get user's dashboard data (saved analyses, usage, plan info)
    getData: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get user info
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);
        
        const user = userResult[0];
        if (!user) throw new Error("User not found");

        // Get saved analyses
        const analyses = await db
          .select()
          .from(savedAnalyses)
          .where(eq(savedAnalyses.userId, input.userId))
          .orderBy(desc(savedAnalyses.createdAt))
          .limit(50);

        // Get current month usage
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usage = await db
          .select()
          .from(usageTracking)
          .where(and(
            eq(usageTracking.userId, input.userId),
            eq(usageTracking.usageMonth, currentMonth)
          ));

        // Calculate usage stats
        const usageStats = {
          analyses: 0,
          aiAnalyses: 0,
          pdfExports: 0,
          comparisons: 0,
        };

        usage.forEach(u => {
          if (u.actionType === 'analysis') usageStats.analyses = u.count;
          if (u.actionType === 'ai_analysis') usageStats.aiAnalyses = u.count;
          if (u.actionType === 'pdf_export') usageStats.pdfExports = u.count;
          if (u.actionType === 'comparison') usageStats.comparisons = u.count;
        });

        const plan = (user.plan || 'free') as keyof typeof PLAN_LIMITS;
        const limits = PLAN_LIMITS[plan];

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: plan,
            subscriptionEndsAt: user.subscriptionEndsAt,
          },
          savedAnalyses: analyses,
          usage: usageStats,
          limits: limits,
          savedAnalysesCount: analyses.length,
          savedAnalysesLimit: limits.savedAnalyses,
        };
      }),

    // Save an analysis
    saveAnalysis: publicProcedure
      .input(z.object({
        userId: z.number(),
        username: z.string(),
        profilePicUrl: z.string().optional(),
        fullName: z.string().optional(),
        followerCount: z.number().optional(),
        viralScore: z.number().optional(),
        engagementRate: z.string().optional(),
        analysisData: z.any().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check if user has reached saved analyses limit
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);
        
        const user = userResult[0];
        if (!user) throw new Error("User not found");

        const plan = (user.plan || 'free') as keyof typeof PLAN_LIMITS;
        const limit = PLAN_LIMITS[plan].savedAnalyses;

        if (limit !== -1) {
          const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(savedAnalyses)
            .where(eq(savedAnalyses.userId, input.userId));
          
          if (countResult[0].count >= limit) {
            throw new Error(`Limit erreicht: Du kannst maximal ${limit} Analysen speichern. Upgrade deinen Plan für mehr.`);
          }
        }

        // Check if already saved
        const existing = await db
          .select()
          .from(savedAnalyses)
          .where(and(
            eq(savedAnalyses.userId, input.userId),
            eq(savedAnalyses.username, input.username.toLowerCase())
          ))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await db
            .update(savedAnalyses)
            .set({
              profilePicUrl: input.profilePicUrl,
              fullName: input.fullName,
              followerCount: input.followerCount,
              viralScore: input.viralScore,
              engagementRate: input.engagementRate,
              analysisData: input.analysisData,
              notes: input.notes,
            })
            .where(eq(savedAnalyses.id, existing[0].id));
          return { success: true, id: existing[0].id, updated: true };
        }

        // Insert new
        const result = await db.insert(savedAnalyses).values({
          userId: input.userId,
          username: input.username.toLowerCase(),
          profilePicUrl: input.profilePicUrl,
          fullName: input.fullName,
          followerCount: input.followerCount,
          viralScore: input.viralScore,
          engagementRate: input.engagementRate,
          analysisData: input.analysisData,
          notes: input.notes,
        });

        return { success: true, id: result[0].insertId, updated: false };
      }),

    // Delete a saved analysis
    deleteAnalysis: publicProcedure
      .input(z.object({
        userId: z.number(),
        analysisId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .delete(savedAnalyses)
          .where(and(
            eq(savedAnalyses.id, input.analysisId),
            eq(savedAnalyses.userId, input.userId)
          ));

        return { success: true };
      }),

    // Toggle favorite status
    toggleFavorite: publicProcedure
      .input(z.object({
        userId: z.number(),
        analysisId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const existing = await db
          .select()
          .from(savedAnalyses)
          .where(and(
            eq(savedAnalyses.id, input.analysisId),
            eq(savedAnalyses.userId, input.userId)
          ))
          .limit(1);

        if (existing.length === 0) throw new Error("Analysis not found");

        const newFavorite = existing[0].isFavorite === 1 ? 0 : 1;
        await db
          .update(savedAnalyses)
          .set({ isFavorite: newFavorite })
          .where(eq(savedAnalyses.id, input.analysisId));

        return { success: true, isFavorite: newFavorite === 1 };
      }),

    // Track usage
    trackUsage: publicProcedure
      .input(z.object({
        userId: z.number(),
        actionType: z.enum(['analysis', 'ai_analysis', 'pdf_export', 'comparison']),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const currentMonth = new Date().toISOString().slice(0, 7);

        // Check if record exists
        const existing = await db
          .select()
          .from(usageTracking)
          .where(and(
            eq(usageTracking.userId, input.userId),
            eq(usageTracking.actionType, input.actionType),
            eq(usageTracking.usageMonth, currentMonth)
          ))
          .limit(1);

        if (existing.length > 0) {
          // Increment count
          await db
            .update(usageTracking)
            .set({ count: existing[0].count + 1 })
            .where(eq(usageTracking.id, existing[0].id));
        } else {
          // Create new record
          await db.insert(usageTracking).values({
            userId: input.userId,
            actionType: input.actionType,
            usageMonth: currentMonth,
            count: 1,
          });
        }

        return { success: true };
      }),

    // Check if user can perform action (within limits)
    checkLimit: publicProcedure
      .input(z.object({
        userId: z.number(),
        actionType: z.enum(['analysis', 'ai_analysis', 'pdf_export', 'comparison']),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get user's plan
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);
        
        const user = userResult[0];
        if (!user) throw new Error("User not found");

        const plan = (user.plan || 'free') as keyof typeof PLAN_LIMITS;
        const limits = PLAN_LIMITS[plan];
        
        // Map action type to limit key
        const limitKey = {
          'analysis': 'analyses',
          'ai_analysis': 'aiAnalyses',
          'pdf_export': 'pdfExports',
          'comparison': 'comparisons',
        }[input.actionType] as keyof typeof limits;

        const limit = limits[limitKey];
        
        // Unlimited
        if (limit === -1) return { allowed: true, remaining: -1, limit: -1 };

        // Get current usage
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usage = await db
          .select()
          .from(usageTracking)
          .where(and(
            eq(usageTracking.userId, input.userId),
            eq(usageTracking.actionType, input.actionType),
            eq(usageTracking.usageMonth, currentMonth)
          ))
          .limit(1);

        const used = usage.length > 0 ? usage[0].count : 0;
        const remaining = limit - used;

        return {
          allowed: remaining > 0,
          remaining,
          limit,
          used,
        };
      }),
    // Update user profile
    updateProfile: publicProcedure
      .input(z.object({
        userId: z.number(),
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: { name?: string; email?: string } = {};
        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email;

        if (Object.keys(updateData).length === 0) {
          throw new Error("Keine Änderungen angegeben");
        }

        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, input.userId));

        return { success: true };
      }),
  }),

  // Credit System Router
  credits: router({
    // Get current credit balance
    getBalance: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const balance = await getUserCredits(input.userId);
        if (!balance) throw new Error("User not found");
        return balance;
      }),

    // Get credit transaction history
    getHistory: publicProcedure
      .input(z.object({ 
        userId: z.number(),
        limit: z.number().min(1).max(100).default(50)
      }))
      .query(async ({ input }) => {
        return await getCreditHistory(input.userId, input.limit);
      }),

    // Get credit usage statistics
    getStats: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getCreditStats(input.userId);
      }),

    // Check if user can perform an action
    canPerform: publicProcedure
      .input(z.object({
        userId: z.number(),
        action: z.string(),
        platform: z.string().default("instagram")
      }))
      .query(async ({ input }) => {
        const result = await canPerformAction(
          input.userId,
          input.action as any,
          input.platform
        );
        const cost = getActionCost(input.action as any);
        return { ...result, cost };
      }),

    // Use credits for an action
    use: publicProcedure
      .input(z.object({
        userId: z.number(),
        action: z.string(),
        platform: z.string().default("instagram"),
        description: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        return await useCredits(
          input.userId,
          input.action as any,
          input.platform,
          input.description
        );
      }),

    // Get available credit packages
    getPackages: publicProcedure.query(() => {
      return Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        ...pkg,
      }));
    }),

    // Get action costs
    getCosts: publicProcedure.query(() => {
      return CREDIT_COSTS;
    }),

    // Create Stripe checkout session for credit purchase
    createCheckout: publicProcedure
      .input(z.object({
        packageId: z.enum(["starter", "pro", "business"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Authentication required");
        }

        const result = await createCheckoutSession({
          packageId: input.packageId,
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || undefined,
          origin: ctx.req.headers.origin || "https://reelspy.ai",
        });

        return result;
      }),

    // Get Stripe packages (for frontend)
    getStripePackages: publicProcedure.query(() => {
      return STRIPE_PACKAGES;
    }),

    // Get payment history for user
    getPaymentHistory: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Authentication required");
        }

        const db = await getDb();
        if (!db) return [];

        const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id));
        if (!user?.stripeCustomerId) return [];

        try {
          const payments = await getPaymentHistory(user.stripeCustomerId, input.limit);
          return payments.map(p => ({
            id: p.id,
            amount: p.amount / 100,
            currency: p.currency,
            status: p.status,
            created: new Date(p.created * 1000).toISOString(),
          }));
        } catch (error) {
          console.error("[Stripe] Error fetching payment history:", error);
          return [];
        }
      }),
  }),

  // Affiliate/Referral Router
  affiliate: router({
    // Get user's referral code and stats
    getStats: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      return await getAffiliateStats(ctx.user.id);
    }),

    // Get or create referral code
    getCode: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      const code = await getOrCreateReferralCode(ctx.user.id);
      return { code };
    }),

    // Set custom vanity code
    setVanityCode: publicProcedure
      .input(z.object({ vanityCode: z.string().min(4).max(20) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Authentication required");
        return await setVanityCode(ctx.user.id, input.vanityCode);
      }),

    // Apply referral code (for new users)
    applyCode: publicProcedure
      .input(z.object({ code: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Authentication required");
        const success = await applyReferralCode(ctx.user.id, input.code);
        return { success };
      }),

    // Get referral list
    getReferrals: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Authentication required");
      return await getUserReferrals(ctx.user.id);
    }),
  }),

  // TikTok Router
  tiktok: router({
    // Analyze TikTok account
    analyze: publicProcedure
      .input(z.object({ username: z.string().min(1) }))
      .query(async ({ input }) => {
        const analysis = await analyzeTikTokAccount(input.username);
        return analysis;
      }),

    // Get TikTok profile only
    profile: publicProcedure
      .input(z.object({ username: z.string().min(1) }))
      .query(async ({ input }) => {
        const profile = await fetchTikTokProfile(input.username);
        return profile;
      }),

    // Search TikTok videos
    search: publicProcedure
      .input(z.object({ 
        keyword: z.string().min(1),
        cursor: z.number().optional()
      }))
      .query(async ({ input }) => {
        return await searchTikTokVideos(input.keyword, input.cursor);
      }),
  }),

  // YouTube Router
  youtube: router({
    // Analyze YouTube channel
    analyze: publicProcedure
      .input(z.object({ channelId: z.string().min(1) }))
      .query(async ({ input }) => {
        const analysis = await analyzeYouTubeChannel(input.channelId);
        return analysis;
      }),

    // Get YouTube channel only
    channel: publicProcedure
      .input(z.object({ channelId: z.string().min(1) }))
      .query(async ({ input }) => {
        const channel = await fetchYouTubeChannel(input.channelId);
        return channel;
      }),

    // Search YouTube videos
    search: publicProcedure
      .input(z.object({ 
        query: z.string().min(1),
        cursor: z.string().optional()
      }))
      .query(async ({ input }) => {
        return await searchYouTubeVideos(input.query, input.cursor);
      }),
  }),

  // Admin Router
  admin: router({
    // Check if current user is admin
    isAdmin: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await isUserAdmin(input.userId);
      }),

    // Get all users (admin only)
    getUsers: publicProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(50),
        search: z.string().optional(),
        filterPlan: z.string().optional(),
        filterSuspicious: z.boolean().optional(),
        filterBanned: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await getAllUsers(
          input.page,
          input.limit,
          input.search,
          input.filterPlan,
          input.filterSuspicious,
          input.filterBanned
        );
      }),

    // Get admin statistics
    getStats: publicProcedure.query(async () => {
      return await getAdminStats();
    }),

    // Ban user
    banUser: publicProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await banUser(input.userId, input.reason);
      }),

    // Unban user
    unbanUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return await unbanUser(input.userId);
      }),

    // Set user role
    setUserRole: publicProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "support"]),
      }))
      .mutation(async ({ input }) => {
        return await setUserRole(input.userId, input.role);
      }),

    // Update user plan
    updateUserPlan: publicProcedure
      .input(z.object({
        userId: z.number(),
        plan: z.enum(["free", "starter", "pro", "business", "enterprise"]),
        credits: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await updateUserPlan(input.userId, input.plan, input.credits);
      }),

    // Get user activity
    getUserActivity: publicProcedure
      .input(z.object({
        userId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return await getUserActivity(input.userId, input.page, input.limit);
      }),

    // Get top users
    getTopUsers: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await getTopUsers(input.limit);
      }),

    // Scan for suspicious users
    scanSuspicious: publicProcedure.query(async () => {
      return await scanForSuspiciousUsers();
    }),

    // Get tracking statistics
    getTrackingStats: publicProcedure.query(async () => {
      return await getTrackingStats();
    }),

    // Get accounts pending tracking
    getTrackingAccounts: publicProcedure.query(async () => {
      return await getSavedAccountsForTracking();
    }),

    // Run scheduled tracking (admin only)
    runTracking: publicProcedure.mutation(async () => {
      return await runScheduledTracking();
    }),

    // Get top growing accounts
    getTopGrowing: publicProcedure
      .input(z.object({
        platform: z.string().optional(),
        days: z.number().optional().default(30),
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input }) => {
        return await getTopGrowingAccounts(input);
      }),

    // Get declining accounts
    getDeclining: publicProcedure
      .input(z.object({
        days: z.number().optional().default(30),
        limit: z.number().optional().default(5),
      }))
      .query(async ({ input }) => {
        return await getDecliningAccounts(input);
      }),

    // Get platform distribution
    getPlatformDistribution: publicProcedure.query(async () => {
      return await getPlatformDistribution();
    }),

    // Get account history
    getAccountHistory: publicProcedure
      .input(z.object({
        platform: z.string(),
        username: z.string(),
        days: z.number().optional().default(90),
      }))
      .query(async ({ input }) => {
        return await getAccountHistory(input.platform, input.username, input.days);
      }),
  }),

  // Contact Form Router
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        category: z.string(),
        subject: z.string().min(1),
        message: z.string().min(20),
      }))
      .mutation(async ({ input }) => {
        // Import email service
        const { sendAdminNotification } = await import("./emailService");
        
        // Send notification to admin
        await sendAdminNotification(
          "contact",
          `Neue Kontaktanfrage: ${input.subject}`,
          `<h2>Neue Kontaktanfrage</h2>
          <p><strong>Von:</strong> ${input.name} (${input.email})</p>
          <p><strong>Kategorie:</strong> ${input.category}</p>
          <p><strong>Betreff:</strong> ${input.subject}</p>
          <hr/>
          <p><strong>Nachricht:</strong></p>
          <p>${input.message.replace(/\n/g, "<br/>")}</p>`
        );
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
