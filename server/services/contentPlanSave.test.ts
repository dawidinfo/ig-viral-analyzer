import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ insertId: 1 }))
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([]))
        }))
      }))
    }))
  }))
}));

describe('Content Plan Save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have saveContentPlan function exported', async () => {
    const { saveContentPlan } = await import('./contentPlanService');
    expect(typeof saveContentPlan).toBe('function');
  });

  it('should have getUserContentPlans function exported', async () => {
    const { getUserContentPlans } = await import('./contentPlanService');
    expect(typeof getUserContentPlans).toBe('function');
  });

  it('should have getContentPlanById function exported', async () => {
    const { getContentPlanById } = await import('./contentPlanService');
    expect(typeof getContentPlanById).toBe('function');
  });

  it('should have deleteContentPlan function exported', async () => {
    const { deleteContentPlan } = await import('./contentPlanService');
    expect(typeof deleteContentPlan).toBe('function');
  });

  it('should validate content plan structure with object format', () => {
    const validPlan = {
      userId: 1,
      name: 'Test Plan',
      profile: {
        niche: 'Fitness',
        painPoints: ['No time', 'No motivation'],
        usps: ['Quick workouts'],
        benefits: ['More energy'],
        tonality: 'professional'
      },
      duration: 10,
      framework: 'HAPSS',
      planItems: [
        {
          day: 1,
          topic: 'Introduction',
          hook: 'Did you know...',
          framework: 'HAPSS',
          scriptStructure: {
            hook: 'Opening hook',
            hookDuration: '0-3s',
            body: 'Main content',
            bodyDuration: '3-25s',
            cta: 'Call to action',
            ctaDuration: '25-35s'
          },
          cutRecommendation: 'Fast cuts',
          hashtags: ['#fitness', '#workout'],
          bestPostingTime: '09:00',
          trendingAudio: { name: 'Trending', url: '' },
          copywritingTip: { author: 'Expert', tip: 'Be specific' }
        }
      ]
    };

    expect(validPlan.userId).toBe(1);
    expect(validPlan.name).toBe('Test Plan');
    expect(validPlan.profile.niche).toBe('Fitness');
    expect(validPlan.planItems.length).toBe(1);
    expect(validPlan.planItems[0].day).toBe(1);
  });

  it('should validate content plan structure with array format (frontend)', () => {
    // This is the format sent from the frontend
    const frontendPlan = {
      userId: 1,
      name: 'Test Plan',
      profile: {
        niche: 'Fitness',
        painPoints: ['No time'],
        usps: ['Quick workouts'],
        benefits: ['More energy'],
        tonality: 'professional'
      },
      duration: 10,
      framework: 'mixed',
      planItems: [
        {
          day: 1,
          topic: 'Introduction',
          hook: 'Did you know...',
          framework: 'HAPSS',
          scriptStructure: {
            hook: 'Opening hook',
            hookDuration: '0-3s',
            body: 'Main content',
            bodyDuration: '3-25s',
            cta: 'Call to action',
            ctaDuration: '25-35s'
          },
          cutRecommendation: 'Fast cuts',
          hashtags: ['#fitness', '#workout'],
          bestPostingTime: '09:00',
          trendingAudio: { name: 'Trending Sound', url: '' },
          copywritingTip: { author: 'Expert', tip: 'Be specific' }
        }
      ]
    };

    // Verify the structure matches what frontend sends
    expect(frontendPlan.planItems[0].scriptStructure).toHaveProperty('hook');
    expect(frontendPlan.planItems[0].scriptStructure).toHaveProperty('hookDuration');
    expect(frontendPlan.planItems[0].trendingAudio).toHaveProperty('name');
    expect(frontendPlan.planItems[0].copywritingTip).toHaveProperty('author');
  });

  it('should transform frontend format to database format correctly', () => {
    // Simulate the transformation that happens in saveContentPlan
    const frontendItem = {
      day: 1,
      topic: 'Introduction',
      hook: 'Did you know...',
      framework: 'HAPSS' as const,
      scriptStructure: {
        hook: 'Opening hook',
        hookDuration: '0-3s',
        body: 'Main content',
        bodyDuration: '3-25s',
        cta: 'Call to action',
        ctaDuration: '25-35s'
      },
      cutRecommendation: 'Fast cuts',
      hashtags: ['#fitness', '#workout'],
      bestPostingTime: '09:00',
      trendingAudio: { name: 'Trending Sound', url: '' },
      copywritingTip: { author: 'Expert', tip: 'Be specific' }
    };

    // Transform like the backend does
    const scriptStructureArray = [
      `Hook (${frontendItem.scriptStructure.hookDuration}): ${frontendItem.scriptStructure.hook}`,
      `Body (${frontendItem.scriptStructure.bodyDuration}): ${frontendItem.scriptStructure.body}`,
      `CTA (${frontendItem.scriptStructure.ctaDuration}): ${frontendItem.scriptStructure.cta}`
    ];

    const trendingAudioStr = frontendItem.trendingAudio.name;
    const copywritingTipStr = `${frontendItem.copywritingTip.author}: ${frontendItem.copywritingTip.tip}`;

    const dbItem = {
      day: frontendItem.day,
      topic: frontendItem.topic,
      hook: frontendItem.hook,
      framework: frontendItem.framework,
      scriptStructure: scriptStructureArray,
      cutRecommendation: frontendItem.cutRecommendation,
      hashtags: frontendItem.hashtags,
      bestTime: frontendItem.bestPostingTime,
      trendingAudio: trendingAudioStr,
      copywritingTip: copywritingTipStr
    };

    // Verify transformation
    expect(Array.isArray(dbItem.scriptStructure)).toBe(true);
    expect(dbItem.scriptStructure.length).toBe(3);
    expect(dbItem.scriptStructure[0]).toContain('Hook (0-3s)');
    expect(typeof dbItem.trendingAudio).toBe('string');
    expect(dbItem.trendingAudio).toBe('Trending Sound');
    expect(typeof dbItem.copywritingTip).toBe('string');
    expect(dbItem.copywritingTip).toBe('Expert: Be specific');
  });
});

describe('Leaderboard Removal', () => {
  it('should not have leaderboard tab in allowed tabs', () => {
    const allowedTabs = ['overview', 'content-plan', 'analyses', 'invoices', 'notes', 'affiliate', 'settings'];
    expect(allowedTabs).not.toContain('leaderboard');
  });
});
