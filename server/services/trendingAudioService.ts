/**
 * Trending Audio Service
 * Provides trending audio recommendations for content plans
 */

export interface TrendingAudio {
  name: string;
  artist: string;
  category: "viral" | "trending" | "classic" | "niche";
  platform: "instagram" | "tiktok" | "both";
  useCase: string;
  popularity: number; // 1-100
}

// Curated list of trending and evergreen audio tracks
const TRENDING_AUDIOS: TrendingAudio[] = [
  // Viral Sounds
  { name: "Original Sound - Motivational Speech", artist: "Various", category: "viral", platform: "both", useCase: "Motivational content, transformations", popularity: 95 },
  { name: "Aesthetic Chill Beat", artist: "LoFi Producer", category: "trending", platform: "instagram", useCase: "Lifestyle, aesthetic content", popularity: 88 },
  { name: "Dramatic Reveal Sound", artist: "Trending Audio", category: "viral", platform: "tiktok", useCase: "Before/After, reveals, surprises", popularity: 92 },
  { name: "Upbeat Corporate", artist: "Background Music", category: "classic", platform: "both", useCase: "Business tips, professional content", popularity: 75 },
  { name: "Emotional Piano", artist: "Cinematic Sounds", category: "classic", platform: "both", useCase: "Storytelling, emotional content", popularity: 82 },
  
  // Educational Content
  { name: "Typing ASMR + Beat", artist: "ASMR Sounds", category: "trending", platform: "tiktok", useCase: "Tips, tutorials, educational", popularity: 85 },
  { name: "Podcast Style Background", artist: "Ambient", category: "classic", platform: "both", useCase: "Talking head, explanations", popularity: 70 },
  { name: "Tech Futuristic", artist: "Electronic", category: "niche", platform: "both", useCase: "Tech content, AI, innovation", popularity: 78 },
  
  // Lifestyle & Entertainment
  { name: "Trending Pop Remix", artist: "DJ Remix", category: "viral", platform: "tiktok", useCase: "Dance, entertainment, fun content", popularity: 90 },
  { name: "Chill Hip Hop Beat", artist: "LoFi Hip Hop", category: "trending", platform: "instagram", useCase: "Day in life, routines", popularity: 86 },
  { name: "Cinematic Epic", artist: "Movie Trailer", category: "classic", platform: "both", useCase: "Epic reveals, achievements", popularity: 80 },
  
  // Business & Finance
  { name: "Money Motivation", artist: "Hustle Culture", category: "viral", platform: "both", useCase: "Finance tips, business content", popularity: 88 },
  { name: "Success Mindset", artist: "Motivational", category: "trending", platform: "tiktok", useCase: "Entrepreneurship, mindset", popularity: 84 },
  
  // Fitness & Health
  { name: "Workout Energy", artist: "Gym Music", category: "niche", platform: "both", useCase: "Fitness, workout content", popularity: 82 },
  { name: "Meditation Calm", artist: "Relaxation", category: "niche", platform: "instagram", useCase: "Wellness, mental health", popularity: 75 },
  
  // Food & Cooking
  { name: "Cooking ASMR", artist: "Kitchen Sounds", category: "trending", platform: "both", useCase: "Recipes, food content", popularity: 87 },
  { name: "Foodie Vibes", artist: "Chill Beat", category: "niche", platform: "instagram", useCase: "Restaurant reviews, food tours", popularity: 79 },
  
  // Travel & Adventure
  { name: "Adventure Cinematic", artist: "Travel Music", category: "classic", platform: "both", useCase: "Travel vlogs, adventures", popularity: 83 },
  { name: "Wanderlust Beat", artist: "Indie", category: "trending", platform: "instagram", useCase: "Travel content, destinations", popularity: 81 },
  
  // Comedy & Entertainment
  { name: "Funny Sound Effect", artist: "Comedy", category: "viral", platform: "tiktok", useCase: "Comedy, memes, reactions", popularity: 91 },
  { name: "Sarcastic Voiceover", artist: "Trending", category: "viral", platform: "tiktok", useCase: "Satire, commentary", popularity: 89 },
];

// Niche-specific audio recommendations
const NICHE_AUDIO_MAP: Record<string, string[]> = {
  "business": ["Money Motivation", "Success Mindset", "Upbeat Corporate", "Podcast Style Background"],
  "finance": ["Money Motivation", "Success Mindset", "Dramatic Reveal Sound", "Tech Futuristic"],
  "fitness": ["Workout Energy", "Trending Pop Remix", "Motivational Speech", "Epic Cinematic"],
  "health": ["Meditation Calm", "Emotional Piano", "Aesthetic Chill Beat", "Podcast Style Background"],
  "food": ["Cooking ASMR", "Foodie Vibes", "Chill Hip Hop Beat", "Aesthetic Chill Beat"],
  "travel": ["Adventure Cinematic", "Wanderlust Beat", "Cinematic Epic", "Trending Pop Remix"],
  "tech": ["Tech Futuristic", "Typing ASMR + Beat", "Dramatic Reveal Sound", "Podcast Style Background"],
  "lifestyle": ["Aesthetic Chill Beat", "Chill Hip Hop Beat", "Trending Pop Remix", "Emotional Piano"],
  "education": ["Typing ASMR + Beat", "Podcast Style Background", "Upbeat Corporate", "Tech Futuristic"],
  "comedy": ["Funny Sound Effect", "Sarcastic Voiceover", "Trending Pop Remix", "Dramatic Reveal Sound"],
  "motivation": ["Original Sound - Motivational Speech", "Success Mindset", "Cinematic Epic", "Emotional Piano"],
  "beauty": ["Aesthetic Chill Beat", "Trending Pop Remix", "Chill Hip Hop Beat", "Dramatic Reveal Sound"],
  "fashion": ["Aesthetic Chill Beat", "Trending Pop Remix", "Chill Hip Hop Beat", "Cinematic Epic"],
  "marketing": ["Money Motivation", "Tech Futuristic", "Upbeat Corporate", "Podcast Style Background"],
  "coaching": ["Original Sound - Motivational Speech", "Success Mindset", "Emotional Piano", "Podcast Style Background"],
};

/**
 * Get trending audio recommendations based on niche and content type
 */
export function getTrendingAudios(
  niche: string,
  contentType?: "educational" | "entertaining" | "motivational" | "storytelling",
  limit: number = 5
): TrendingAudio[] {
  const normalizedNiche = niche.toLowerCase();
  
  // Find matching niche keywords
  let matchedNiche = "lifestyle"; // default
  for (const [key, _] of Object.entries(NICHE_AUDIO_MAP)) {
    if (normalizedNiche.includes(key)) {
      matchedNiche = key;
      break;
    }
  }
  
  // Get niche-specific audio names
  const nicheAudioNames = NICHE_AUDIO_MAP[matchedNiche] || NICHE_AUDIO_MAP["lifestyle"];
  
  // Filter and sort audios
  let recommendations = TRENDING_AUDIOS.filter(audio => 
    nicheAudioNames.includes(audio.name) || audio.category === "viral"
  );
  
  // Sort by popularity
  recommendations.sort((a, b) => b.popularity - a.popularity);
  
  // Apply content type filter if provided
  if (contentType) {
    const contentTypeMap: Record<string, string[]> = {
      "educational": ["Tips, tutorials", "Talking head", "Tech content"],
      "entertaining": ["Dance, entertainment", "Comedy, memes", "Fun content"],
      "motivational": ["Motivational content", "Mindset", "Success"],
      "storytelling": ["Storytelling", "Emotional", "Cinematic"],
    };
    
    const preferredUseCases = contentTypeMap[contentType] || [];
    recommendations = recommendations.filter(audio =>
      preferredUseCases.some(useCase => 
        audio.useCase.toLowerCase().includes(useCase.toLowerCase())
      ) || audio.category === "viral"
    );
  }
  
  return recommendations.slice(0, limit);
}

/**
 * Get a single audio recommendation for a specific content plan item
 */
export function getAudioForContent(
  topic: string,
  niche: string,
  framework: "HAPSS" | "AIDA"
): TrendingAudio {
  const topicLower = topic.toLowerCase();
  
  // Determine content type based on topic and framework
  let contentType: "educational" | "entertaining" | "motivational" | "storytelling" = "educational";
  
  if (topicLower.includes("story") || topicLower.includes("transformation") || framework === "HAPSS") {
    contentType = "storytelling";
  } else if (topicLower.includes("tip") || topicLower.includes("how") || topicLower.includes("guide")) {
    contentType = "educational";
  } else if (topicLower.includes("motivation") || topicLower.includes("mindset") || topicLower.includes("success")) {
    contentType = "motivational";
  } else if (topicLower.includes("fun") || topicLower.includes("react") || topicLower.includes("trend")) {
    contentType = "entertaining";
  }
  
  const recommendations = getTrendingAudios(niche, contentType, 3);
  
  // Return a random one from top 3 for variety
  const randomIndex = Math.floor(Math.random() * Math.min(3, recommendations.length));
  return recommendations[randomIndex] || TRENDING_AUDIOS[0];
}

/**
 * Get all trending audios for display
 */
export function getAllTrendingAudios(): TrendingAudio[] {
  return [...TRENDING_AUDIOS].sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get trending audios by category
 */
export function getTrendingAudiosByCategory(category: "viral" | "trending" | "classic" | "niche"): TrendingAudio[] {
  return TRENDING_AUDIOS
    .filter(audio => audio.category === category)
    .sort((a, b) => b.popularity - a.popularity);
}
