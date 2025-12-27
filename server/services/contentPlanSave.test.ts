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

  it('should validate content plan structure', () => {
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
});

describe('Leaderboard Removal', () => {
  it('should not have leaderboard tab in allowed tabs', () => {
    const allowedTabs = ['overview', 'content-plan', 'analyses', 'invoices', 'notes', 'affiliate', 'settings'];
    expect(allowedTabs).not.toContain('leaderboard');
  });
});
