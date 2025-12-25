import { invokeLLM } from "../_core/llm";
import { getAudioForContent, TrendingAudio } from "./trendingAudioService";

export interface TargetAudienceProfile {
  niche: string;
  painPoints: string[];
  usps: string[];
  benefits: string[];
  tonality: string;
  accountUsername?: string;
}

export interface ContentPlanItem {
  day: number;
  topic: string;
  hook: string;
  framework: "HAPSS" | "AIDA";
  scriptStructure: {
    hook: string;
    hookDuration: string;
    body: string;
    bodyDuration: string;
    cta: string;
    ctaDuration: string;
  };
  copywritingTip: {
    author: "Hopkins" | "Ogilvy" | "Schwartz";
    tip: string;
  };
  cutRecommendation: string;
  hashtags: string[];
  bestPostingTime: string;
  estimatedViews: string;
  trendingAudio: {
    name: string;
    artist: string;
    category: string;
    useCase: string;
  };
}

export interface ContentPlan {
  profile: TargetAudienceProfile;
  duration: 10 | 20 | 30;
  items: ContentPlanItem[];
  generatedAt: string;
}

const COPYWRITING_TIPS = {
  Hopkins: [
    "Sei spezifisch - 'Spart 23% Energie' schlägt 'Spart Energie' jedes Mal",
    "Teste alles - Meinungen sind wertlos, nur Daten zählen",
    "Biete einen Service an, nicht nur ein Produkt",
    "Nutze Curiosity - Lass sie mehr wissen wollen",
    "Zeige den Beweis - Behauptungen ohne Beweis sind wertlos"
  ],
  Ogilvy: [
    "Die Headline ist 80% deiner Werbung - investiere 80% deiner Zeit",
    "Verkaufe Benefits, nicht Features",
    "Nutze 'Du' und 'Dein' - sprich direkt zum Zuschauer",
    "Erzähle eine Geschichte - Menschen lieben Geschichten",
    "Sei ehrlich - Lügen werden immer aufgedeckt"
  ],
  Schwartz: [
    "Verstärke existierende Wünsche - erschaffe keine neuen",
    "Nutze die Sprache deiner Zielgruppe",
    "Zeige die Transformation - Vorher vs. Nachher",
    "Adressiere den dominanten Wunsch zuerst",
    "Nutze Social Proof - Menschen folgen Menschen"
  ]
};

const FRAMEWORKS = {
  HAPSS: {
    name: "HAPSS",
    description: "Hook, Attention, Problem, Story, Solution",
    bestFor: "Emotionale Themen, Transformationen, persönliche Geschichten"
  },
  AIDA: {
    name: "AIDA",
    description: "Attention, Interest, Desire, Action",
    bestFor: "Produkte, Services, direkte Verkäufe, klare CTAs"
  }
};

export async function generateContentPlan(
  profile: TargetAudienceProfile,
  duration: 10 | 20 | 30
): Promise<ContentPlan> {
  const systemPrompt = `Du bist ein erfahrener Social Media Stratege und Content Creator mit Expertise in viralen Instagram Reels.
Du erstellst personalisierte Content-Pläne basierend auf dem HAPSS-Framework (Hook, Attention, Problem, Story, Solution) und AIDA-Framework (Attention, Interest, Desire, Action).
Du kennst die Copywriting-Prinzipien von Claude Hopkins, David Ogilvy und Eugene Schwartz.

Wichtige Regeln:
- Hooks müssen in den ersten 0.5-1.5 Sekunden greifen
- Schnitte alle 2-3 Sekunden für maximale Retention
- Jedes Reel braucht einen klaren CTA
- Nutze Pain Points der Zielgruppe für emotionale Hooks
- Variiere zwischen HAPSS und AIDA je nach Thema
- Posting-Zeiten basieren auf deutscher Zielgruppe (18:00-21:00 optimal)`;

  const userPrompt = `Erstelle einen ${duration}-Tage Content-Plan für folgendes Zielgruppen-Profil:

**Nische:** ${profile.niche}
**Pain Points:** ${profile.painPoints.join(", ")}
**USPs:** ${profile.usps.join(", ")}
**Benefits:** ${profile.benefits.join(", ")}
**Tonalität:** ${profile.tonality}
${profile.accountUsername ? `**Account:** @${profile.accountUsername}` : ""}

Für jeden Tag erstelle:
1. Ein spezifisches Thema
2. Einen Hook (max. 10 Wörter, muss in 1.5 Sek greifen)
3. Framework-Auswahl (HAPSS oder AIDA)
4. Script-Struktur mit Zeitangaben (Hook: 1-2s, Body: 15-25s, CTA: 3-5s)
5. Einen Copywriting-Tipp von Hopkins, Ogilvy oder Schwartz
6. Schnitt-Empfehlung
7. 5 relevante Hashtags
8. Beste Posting-Zeit
9. Geschätzte Views (basierend auf Thema-Potenzial)

Antworte NUR mit einem validen JSON-Array ohne zusätzlichen Text.`;

  const outputSchema = {
    name: "content_plan",
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              topic: { type: "string" },
              hook: { type: "string" },
              framework: { type: "string", enum: ["HAPSS", "AIDA"] },
              scriptStructure: {
                type: "object",
                properties: {
                  hook: { type: "string" },
                  hookDuration: { type: "string" },
                  body: { type: "string" },
                  bodyDuration: { type: "string" },
                  cta: { type: "string" },
                  ctaDuration: { type: "string" }
                },
                required: ["hook", "hookDuration", "body", "bodyDuration", "cta", "ctaDuration"]
              },
              copywritingTip: {
                type: "object",
                properties: {
                  author: { type: "string", enum: ["Hopkins", "Ogilvy", "Schwartz"] },
                  tip: { type: "string" }
                },
                required: ["author", "tip"]
              },
              cutRecommendation: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              bestPostingTime: { type: "string" },
              estimatedViews: { type: "string" }
            },
            required: ["day", "topic", "hook", "framework", "scriptStructure", "copywritingTip", "cutRecommendation", "hashtags", "bestPostingTime", "estimatedViews"]
          }
        }
      },
      required: ["items"]
    },
    strict: true
  };

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      outputSchema
    });

    const content = result.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No content in LLM response");
    }

    const parsed = JSON.parse(content);
    const items: ContentPlanItem[] = parsed.items || [];

    // Validiere und ergänze fehlende Daten
    const validatedItems = items.map((item, index) => ({
      day: item.day || index + 1,
      topic: item.topic || `Thema Tag ${index + 1}`,
      hook: item.hook || "Wusstest du das?",
      framework: (item.framework === "AIDA" ? "AIDA" : "HAPSS") as "HAPSS" | "AIDA",
      scriptStructure: {
        hook: item.scriptStructure?.hook || item.hook || "Hook",
        hookDuration: item.scriptStructure?.hookDuration || "1-2s",
        body: item.scriptStructure?.body || "Hauptinhalt",
        bodyDuration: item.scriptStructure?.bodyDuration || "15-20s",
        cta: item.scriptStructure?.cta || "Folge für mehr!",
        ctaDuration: item.scriptStructure?.ctaDuration || "3-5s"
      },
      copywritingTip: {
        author: (["Hopkins", "Ogilvy", "Schwartz"].includes(item.copywritingTip?.author) 
          ? item.copywritingTip.author 
          : ["Hopkins", "Ogilvy", "Schwartz"][index % 3]) as "Hopkins" | "Ogilvy" | "Schwartz",
        tip: item.copywritingTip?.tip || COPYWRITING_TIPS[["Hopkins", "Ogilvy", "Schwartz"][index % 3] as keyof typeof COPYWRITING_TIPS][index % 5]
      },
      cutRecommendation: item.cutRecommendation || "Schnitt alle 2-3 Sekunden für maximale Retention",
      hashtags: Array.isArray(item.hashtags) && item.hashtags.length > 0 
        ? item.hashtags.slice(0, 5) 
        : ["#reels", "#viral", "#tipps", "#content", "#creator"],
      bestPostingTime: item.bestPostingTime || ["18:00", "19:00", "20:00", "12:00", "21:00"][index % 5],
      estimatedViews: item.estimatedViews || `${Math.floor(Math.random() * 50 + 10)}K-${Math.floor(Math.random() * 100 + 50)}K`,
      trendingAudio: (() => {
        const audio = getAudioForContent(item.topic || "", profile.niche, item.framework === "AIDA" ? "AIDA" : "HAPSS");
        return {
          name: audio.name,
          artist: audio.artist,
          category: audio.category,
          useCase: audio.useCase
        };
      })()
    }));

    return {
      profile,
      duration,
      items: validatedItems,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating content plan:", error);
    // Fallback zu Demo-Daten wenn KI fehlschlägt
    return generateDemoContentPlan(profile, duration);
  }
}

function generateDemoContentPlan(
  profile: TargetAudienceProfile,
  duration: 10 | 20 | 30
): ContentPlan {
  const topics = [
    { topic: "Pain Point Opener", hook: "90% machen diesen Fehler..." },
    { topic: "Behind the Scenes", hook: "Das zeigt dir niemand..." },
    { topic: "Transformation Story", hook: "Vor 6 Monaten war ich..." },
    { topic: "Quick Win Tipp", hook: "In 30 Sekunden lernst du..." },
    { topic: "Myth Buster", hook: "Das ist der größte Mythos..." },
    { topic: "Tool Empfehlung", hook: "Dieses Tool hat alles verändert..." },
    { topic: "Fehler-Analyse", hook: "Ich habe €10.000 verloren weil..." },
    { topic: "Step-by-Step Guide", hook: "So machst du es richtig..." },
    { topic: "Trend-Reaktion", hook: "Alle reden darüber, aber..." },
    { topic: "Q&A Session", hook: "Die häufigste Frage ist..." },
    { topic: "Case Study", hook: "Wie ich in 30 Tagen..." },
    { topic: "Unpopular Opinion", hook: "Das will niemand hören..." },
    { topic: "Vergleich", hook: "A vs B - was ist besser?" },
    { topic: "Geheimtipp", hook: "Das wissen nur die Profis..." },
    { topic: "Motivation", hook: "Wenn du aufgeben willst..." },
    { topic: "Checkliste", hook: "5 Dinge die du heute tun musst..." },
    { topic: "Interview Snippet", hook: "Der Experte sagt..." },
    { topic: "Trend Prediction", hook: "Das kommt 2025..." },
    { topic: "Reaktion auf Kommentar", hook: "Jemand hat gefragt..." },
    { topic: "Recap der Woche", hook: "Diese Woche habe ich gelernt..." },
    { topic: "Behind the Numbers", hook: "Diese Zahl hat mich schockiert..." },
    { topic: "Anfänger vs Profi", hook: "Der Unterschied ist..." },
    { topic: "Mein größter Fehler", hook: "Das hätte ich nie tun sollen..." },
    { topic: "Schneller Hack", hook: "Spar dir Stunden mit..." },
    { topic: "Mindset Shift", hook: "Das hat alles verändert..." },
    { topic: "Tool Stack", hook: "Meine 3 wichtigsten Tools..." },
    { topic: "Kundenfeedback", hook: "Das sagen meine Kunden..." },
    { topic: "Branchentrend", hook: "Das verändert gerade alles..." },
    { topic: "Persönliche Geschichte", hook: "Ich muss dir etwas erzählen..." },
    { topic: "Zusammenfassung", hook: "Die wichtigsten Learnings..." }
  ];

  const items: ContentPlanItem[] = [];
  for (let i = 0; i < duration; i++) {
    const topicData = topics[i % topics.length];
    const framework = i % 2 === 0 ? "HAPSS" : "AIDA";
    const author = ["Hopkins", "Ogilvy", "Schwartz"][i % 3] as "Hopkins" | "Ogilvy" | "Schwartz";
    
    items.push({
      day: i + 1,
      topic: topicData.topic,
      hook: topicData.hook,
      framework,
      scriptStructure: {
        hook: topicData.hook,
        hookDuration: "1-2s",
        body: `Erkläre ${topicData.topic} mit Bezug auf ${profile.painPoints[0] || "dein Problem"}`,
        bodyDuration: "15-20s",
        cta: "Folge für mehr Tipps!",
        ctaDuration: "3-5s"
      },
      copywritingTip: {
        author,
        tip: COPYWRITING_TIPS[author][i % 5]
      },
      cutRecommendation: "Schnitt alle 2-3 Sekunden, besonders bei Übergängen",
      hashtags: [
        `#${profile.niche.toLowerCase().replace(/\s/g, "")}`,
        "#reels",
        "#viral",
        "#tipps",
        "#creator"
      ],
      bestPostingTime: ["18:00", "19:00", "20:00", "12:00", "21:00"][i % 5],
      estimatedViews: `${Math.floor(Math.random() * 50 + 10)}K-${Math.floor(Math.random() * 100 + 50)}K`,
      trendingAudio: (() => {
        const audio = getAudioForContent(topicData.topic, profile.niche, framework);
        return {
          name: audio.name,
          artist: audio.artist,
          category: audio.category,
          useCase: audio.useCase
        };
      })()
    });
  }

  return {
    profile,
    duration,
    items,
    generatedAt: new Date().toISOString()
  };
}

export { generateDemoContentPlan };


// Database functions for saving/loading content plans
import { getDb } from "../db";
import { savedContentPlans } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function saveContentPlan(
  userId: number,
  name: string,
  profile: TargetAudienceProfile,
  duration: number,
  framework: "HAPSS" | "AIDA" | "mixed",
  planItems: ContentPlanItem[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(savedContentPlans).values({
    userId,
    name,
    profile: {
      niche: profile.niche,
      painPoints: profile.painPoints,
      usps: profile.usps,
      benefits: profile.benefits,
      tonality: profile.tonality
    },
    duration,
    framework,
    planItems: planItems.map(item => ({
      day: item.day,
      topic: item.topic,
      hook: item.hook,
      framework: item.framework,
      scriptStructure: [
        `Hook (${item.scriptStructure.hookDuration}): ${item.scriptStructure.hook}`,
        `Body (${item.scriptStructure.bodyDuration}): ${item.scriptStructure.body}`,
        `CTA (${item.scriptStructure.ctaDuration}): ${item.scriptStructure.cta}`
      ],
      cutRecommendation: item.cutRecommendation,
      hashtags: item.hashtags,
      bestTime: item.bestPostingTime,
      trendingAudio: "Trending Sound",
      copywritingTip: `${item.copywritingTip.author}: ${item.copywritingTip.tip}`
    }))
  });

  return result;
}

export async function getUserContentPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const plans = await db
    .select()
    .from(savedContentPlans)
    .where(eq(savedContentPlans.userId, userId))
    .orderBy(desc(savedContentPlans.createdAt));

  return plans;
}

export async function getContentPlanById(planId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const plans = await db
    .select()
    .from(savedContentPlans)
    .where(eq(savedContentPlans.id, planId));

  const plan = plans[0];
  if (!plan || plan.userId !== userId) {
    return null;
  }

  return plan;
}

export async function deleteContentPlan(planId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const plan = await getContentPlanById(planId, userId);
  if (!plan) {
    throw new Error("Plan not found or access denied");
  }

  await db.delete(savedContentPlans).where(eq(savedContentPlans.id, planId));
  return true;
}

export async function toggleFavorite(planId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const plan = await getContentPlanById(planId, userId);
  if (!plan) {
    throw new Error("Plan not found or access denied");
  }

  await db
    .update(savedContentPlans)
    .set({ isFavorite: plan.isFavorite ? 0 : 1 })
    .where(eq(savedContentPlans.id, planId));

  return !plan.isFavorite;
}


// ===== PROFILE-BASED CONTENT PLAN GENERATION =====

export interface ProfileAnalysisData {
  username: string;
  platform: "instagram" | "tiktok" | "youtube";
  topReels?: Array<{
    caption?: string;
    likes?: number;
    comments?: number;
    views?: number;
    hashtags?: string[];
  }>;
  postingTimes?: {
    bestDays?: string[];
    bestHours?: number[];
  };
  commonHashtags?: string[];
  avgEngagement?: number;
  followerCount?: number;
  niche?: string;
  contentStyle?: string;
}

export async function generateProfileBasedContentPlan(
  profileData: ProfileAnalysisData,
  duration: 10 | 20 | 30
): Promise<ContentPlan> {
  // Extract insights from profile data
  const topCaptions = profileData.topReels?.slice(0, 5).map(r => r.caption).filter(Boolean) || [];
  const topHashtags = profileData.commonHashtags?.slice(0, 10) || [];
  const bestPostingTimes = profileData.postingTimes?.bestHours?.map(h => `${h}:00`) || ["18:00", "19:00", "20:00"];
  const avgEngagement = profileData.avgEngagement || 0;
  
  // Analyze content patterns from top reels
  const contentPatterns = analyzeContentPatterns(topCaptions);
  
  const systemPrompt = `Du bist ein erfahrener Social Media Stratege. Du analysierst erfolgreiche Content-Muster eines Instagram-Profils und erstellst darauf basierend einen personalisierten Content-Plan.

Du hast Zugriff auf die Performance-Daten des Profils @${profileData.username}:
- Durchschnittliches Engagement: ${avgEngagement.toFixed(2)}%
- Follower: ${profileData.followerCount?.toLocaleString() || "unbekannt"}
- Top Hashtags: ${topHashtags.join(", ") || "keine Daten"}
- Beste Posting-Zeiten: ${bestPostingTimes.join(", ")}
- Content-Stil: ${profileData.contentStyle || "gemischt"}
- Nische: ${profileData.niche || "allgemein"}

Erfolgreiche Captions des Profils:
${topCaptions.map((c, i) => `${i + 1}. "${c?.slice(0, 100)}..."`).join("\n")}

Erkannte Muster:
${contentPatterns.map(p => `- ${p}`).join("\n")}

Erstelle Content-Ideen die:
1. Auf den erfolgreichen Mustern des Profils aufbauen
2. Die gleiche Tonalität und Stil verwenden
3. Ähnliche Hook-Strukturen nutzen
4. Die bewährten Hashtags einbeziehen
5. Zu den optimalen Posting-Zeiten passen`;

  const userPrompt = `Erstelle einen ${duration}-Tage Content-Plan für @${profileData.username} basierend auf den analysierten Erfolgsfaktoren.

Für jeden Tag:
1. Thema (inspiriert von erfolgreichen Posts)
2. Hook im Stil der Top-Performer
3. Framework (HAPSS oder AIDA)
4. Script-Struktur
5. Copywriting-Tipp
6. Schnitt-Empfehlung
7. Hashtags (Mix aus bewährten + neuen)
8. Beste Posting-Zeit
9. Geschätzte Views

Antworte NUR mit einem validen JSON-Array.`;

  const outputSchema = {
    name: "profile_content_plan",
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              topic: { type: "string" },
              hook: { type: "string" },
              framework: { type: "string", enum: ["HAPSS", "AIDA"] },
              scriptStructure: {
                type: "object",
                properties: {
                  hook: { type: "string" },
                  hookDuration: { type: "string" },
                  body: { type: "string" },
                  bodyDuration: { type: "string" },
                  cta: { type: "string" },
                  ctaDuration: { type: "string" }
                },
                required: ["hook", "hookDuration", "body", "bodyDuration", "cta", "ctaDuration"]
              },
              copywritingTip: {
                type: "object",
                properties: {
                  author: { type: "string", enum: ["Hopkins", "Ogilvy", "Schwartz"] },
                  tip: { type: "string" }
                },
                required: ["author", "tip"]
              },
              cutRecommendation: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              bestPostingTime: { type: "string" },
              estimatedViews: { type: "string" },
              inspirationSource: { type: "string" }
            },
            required: ["day", "topic", "hook", "framework", "scriptStructure", "copywritingTip", "cutRecommendation", "hashtags", "bestPostingTime", "estimatedViews"]
          }
        }
      },
      required: ["items"]
    },
    strict: true
  };

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      outputSchema
    });

    const content = result.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No content in LLM response");
    }

    const parsed = JSON.parse(content);
    const items: ContentPlanItem[] = parsed.items || [];

    // Validate and enhance with profile data
    const validatedItems = items.map((item, index) => ({
      day: item.day || index + 1,
      topic: item.topic || `Thema Tag ${index + 1}`,
      hook: item.hook || "Wusstest du das?",
      framework: (item.framework === "AIDA" ? "AIDA" : "HAPSS") as "HAPSS" | "AIDA",
      scriptStructure: {
        hook: item.scriptStructure?.hook || item.hook || "Hook",
        hookDuration: item.scriptStructure?.hookDuration || "1-2s",
        body: item.scriptStructure?.body || "Hauptinhalt",
        bodyDuration: item.scriptStructure?.bodyDuration || "15-20s",
        cta: item.scriptStructure?.cta || "Folge für mehr!",
        ctaDuration: item.scriptStructure?.ctaDuration || "3-5s"
      },
      copywritingTip: {
        author: (["Hopkins", "Ogilvy", "Schwartz"].includes(item.copywritingTip?.author) 
          ? item.copywritingTip.author 
          : ["Hopkins", "Ogilvy", "Schwartz"][index % 3]) as "Hopkins" | "Ogilvy" | "Schwartz",
        tip: item.copywritingTip?.tip || COPYWRITING_TIPS[["Hopkins", "Ogilvy", "Schwartz"][index % 3] as keyof typeof COPYWRITING_TIPS][index % 5]
      },
      cutRecommendation: item.cutRecommendation || "Schnitt alle 2-3 Sekunden",
      hashtags: mergeHashtags(item.hashtags, topHashtags, 5),
      bestPostingTime: item.bestPostingTime || bestPostingTimes[index % bestPostingTimes.length],
      estimatedViews: item.estimatedViews || calculateEstimatedViews(avgEngagement, profileData.followerCount || 1000),
      trendingAudio: (() => {
        const audio = getAudioForContent(item.topic || "", profileData.niche || "", item.framework === "AIDA" ? "AIDA" : "HAPSS");
        return {
          name: audio.name,
          artist: audio.artist,
          category: audio.category,
          useCase: audio.useCase
        };
      })()
    }));

    // Create a profile from the analysis data
    const derivedProfile: TargetAudienceProfile = {
      niche: profileData.niche || "allgemein",
      painPoints: contentPatterns.slice(0, 3),
      usps: [`Expertise von @${profileData.username}`],
      benefits: ["Mehr Engagement", "Höhere Reichweite", "Virale Inhalte"],
      tonality: profileData.contentStyle || "professional",
      accountUsername: profileData.username
    };

    return {
      profile: derivedProfile,
      duration,
      items: validatedItems,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating profile-based content plan:", error);
    // Fallback to demo plan with profile data
    return generateProfileBasedDemoPlan(profileData, duration);
  }
}

function analyzeContentPatterns(captions: (string | undefined)[]): string[] {
  const patterns: string[] = [];
  
  for (const caption of captions) {
    if (!caption) continue;
    
    // Detect question hooks
    if (caption.includes("?")) {
      patterns.push("Fragen als Hook verwenden");
    }
    
    // Detect number-based hooks
    if (/\d+/.test(caption.slice(0, 50))) {
      patterns.push("Zahlen für Aufmerksamkeit nutzen");
    }
    
    // Detect emotional words
    if (/fehler|problem|geheim|trick|hack|einfach|schnell/i.test(caption)) {
      patterns.push("Emotionale Trigger-Wörter einsetzen");
    }
    
    // Detect list format
    if (/\d\.|•|-/.test(caption)) {
      patterns.push("Listen-Format für Struktur");
    }
    
    // Detect personal stories
    if (/ich|mein|mir/i.test(caption)) {
      patterns.push("Persönliche Geschichten erzählen");
    }
  }
  
  // Remove duplicates and limit
  return Array.from(new Set(patterns)).slice(0, 5);
}

function mergeHashtags(generated: string[] | undefined, profile: string[], limit: number): string[] {
  const all = [...(generated || []), ...profile];
  const unique = Array.from(new Set(all.map(h => h.startsWith("#") ? h : `#${h}`)));
  return unique.slice(0, limit);
}

function calculateEstimatedViews(engagement: number, followers: number): string {
  const baseViews = followers * (engagement / 100) * 2;
  const minViews = Math.floor(baseViews * 0.5);
  const maxViews = Math.floor(baseViews * 1.5);
  
  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };
  
  return `${formatNumber(minViews)}-${formatNumber(maxViews)}`;
}

function generateProfileBasedDemoPlan(
  profileData: ProfileAnalysisData,
  duration: 10 | 20 | 30
): ContentPlan {
  const topHashtags = profileData.commonHashtags?.slice(0, 5) || ["#reels", "#viral"];
  const bestTimes = profileData.postingTimes?.bestHours?.map(h => `${h}:00`) || ["18:00", "19:00"];
  
  const topics = [
    { topic: `Wie @${profileData.username} viral geht`, hook: "Das ist mein Geheimnis..." },
    { topic: "Behind the Scenes", hook: "So sieht mein Alltag wirklich aus..." },
    { topic: "Top-Performer Analyse", hook: "Dieses Reel hat alles verändert..." },
    { topic: "Engagement-Boost Strategie", hook: "So bekommst du mehr Kommentare..." },
    { topic: "Hook-Formel", hook: "In 1 Sekunde hast du ihre Aufmerksamkeit..." },
    { topic: "Content-Recycling", hook: "Aus 1 Reel mache ich 5..." },
    { topic: "Hashtag-Strategie", hook: "Diese Hashtags bringen Views..." },
    { topic: "Posting-Zeit Hack", hook: "Poste NIEMALS um diese Zeit..." },
    { topic: "Trend-Riding", hook: "So nutzt du Trends richtig..." },
    { topic: "Community Building", hook: "Deine Follower sind dein Kapital..." }
  ];

  const items: ContentPlanItem[] = [];
  for (let i = 0; i < duration; i++) {
    const topicData = topics[i % topics.length];
    const framework = i % 2 === 0 ? "HAPSS" : "AIDA";
    const author = ["Hopkins", "Ogilvy", "Schwartz"][i % 3] as "Hopkins" | "Ogilvy" | "Schwartz";
    
    items.push({
      day: i + 1,
      topic: topicData.topic,
      hook: topicData.hook,
      framework,
      scriptStructure: {
        hook: topicData.hook,
        hookDuration: "1-2s",
        body: `Erkläre ${topicData.topic} mit Beispielen von @${profileData.username}`,
        bodyDuration: "15-20s",
        cta: "Folge für mehr Tipps!",
        ctaDuration: "3-5s"
      },
      copywritingTip: {
        author,
        tip: COPYWRITING_TIPS[author][i % 5]
      },
      cutRecommendation: "Schnitt alle 2-3 Sekunden",
      hashtags: mergeHashtags([], topHashtags, 5),
      bestPostingTime: bestTimes[i % bestTimes.length],
      estimatedViews: calculateEstimatedViews(profileData.avgEngagement || 5, profileData.followerCount || 1000),
      trendingAudio: (() => {
        const audio = getAudioForContent(topicData.topic, profileData.niche || "", framework);
        return {
          name: audio.name,
          artist: audio.artist,
          category: audio.category,
          useCase: audio.useCase
        };
      })()
    });
  }

  const derivedProfile: TargetAudienceProfile = {
    niche: profileData.niche || "Content Creation",
    painPoints: ["Wenig Reichweite", "Niedrige Engagement-Rate", "Keine viralen Reels"],
    usps: [`Expertise von @${profileData.username}`],
    benefits: ["Mehr Engagement", "Höhere Reichweite", "Virale Inhalte"],
    tonality: profileData.contentStyle || "professional",
    accountUsername: profileData.username
  };

  return {
    profile: derivedProfile,
    duration,
    items,
    generatedAt: new Date().toISOString()
  };
}
