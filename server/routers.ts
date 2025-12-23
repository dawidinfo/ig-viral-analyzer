import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyzeInstagramAccount, fetchInstagramProfile, fetchInstagramPosts, fetchInstagramReels, InstagramAnalysis } from "./instagram";
import { analyzeReel } from "./reelAnalysis";
import { getDb } from "./db";
import { instagramCache, savedAnalyses, usageTracking, PLAN_LIMITS, users } from "../drizzle/schema";
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
  }),
});

export type AppRouter = typeof appRouter;
