import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyzeInstagramAccount, fetchInstagramProfile, fetchInstagramPosts, fetchInstagramReels, InstagramAnalysis } from "./instagram";
import { analyzeReel } from "./reelAnalysis";
import { getDb } from "./db";
import { instagramCache } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
});

export type AppRouter = typeof appRouter;
