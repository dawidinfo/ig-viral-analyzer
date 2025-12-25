import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateContentPlan, generateDemoContentPlan, TargetAudienceProfile } from './contentPlanService';

// Mock the LLM module
vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn()
}));

describe('Content Plan Service', () => {
  const testProfile: TargetAudienceProfile = {
    niche: 'Fitness',
    painPoints: ['Keine Zeit für Sport', 'Motivation fehlt', 'Keine Ergebnisse'],
    usps: ['Schnelle Workouts', '15 Minuten täglich'],
    benefits: ['Mehr Energie', 'Bessere Figur', 'Mehr Selbstbewusstsein'],
    tonality: 'motivational',
    accountUsername: 'fitness_coach'
  };

  describe('generateDemoContentPlan', () => {
    it('should generate a 10-day demo content plan', () => {
      const plan = generateDemoContentPlan(testProfile, 10);
      
      expect(plan).toBeDefined();
      expect(plan.items).toHaveLength(10);
      expect(plan.duration).toBe(10);
      expect(plan.profile).toEqual(testProfile);
      expect(plan.generatedAt).toBeDefined();
    });

    it('should generate a 20-day demo content plan', () => {
      const plan = generateDemoContentPlan(testProfile, 20);
      
      expect(plan.items).toHaveLength(20);
      expect(plan.duration).toBe(20);
    });

    it('should generate a 30-day demo content plan', () => {
      const plan = generateDemoContentPlan(testProfile, 30);
      
      expect(plan.items).toHaveLength(30);
      expect(plan.duration).toBe(30);
    });

    it('should include all required fields in each content plan item', () => {
      const plan = generateDemoContentPlan(testProfile, 10);
      
      plan.items.forEach((item, index) => {
        expect(item.day).toBe(index + 1);
        expect(item.topic).toBeDefined();
        expect(item.hook).toBeDefined();
        expect(item.framework).toMatch(/^(HAPSS|AIDA)$/);
        expect(item.scriptStructure).toBeDefined();
        expect(item.scriptStructure.hook).toBeDefined();
        expect(item.scriptStructure.hookDuration).toBeDefined();
        expect(item.scriptStructure.body).toBeDefined();
        expect(item.scriptStructure.bodyDuration).toBeDefined();
        expect(item.scriptStructure.cta).toBeDefined();
        expect(item.scriptStructure.ctaDuration).toBeDefined();
        expect(item.copywritingTip).toBeDefined();
        expect(item.copywritingTip.author).toMatch(/^(Hopkins|Ogilvy|Schwartz)$/);
        expect(item.copywritingTip.tip).toBeDefined();
        expect(item.cutRecommendation).toBeDefined();
        expect(item.hashtags).toBeInstanceOf(Array);
        expect(item.hashtags.length).toBeGreaterThan(0);
        expect(item.bestPostingTime).toBeDefined();
        expect(item.estimatedViews).toBeDefined();
      });
    });

    it('should alternate between HAPSS and AIDA frameworks', () => {
      const plan = generateDemoContentPlan(testProfile, 10);
      
      const hapssCount = plan.items.filter(item => item.framework === 'HAPSS').length;
      const aidaCount = plan.items.filter(item => item.framework === 'AIDA').length;
      
      expect(hapssCount).toBeGreaterThan(0);
      expect(aidaCount).toBeGreaterThan(0);
    });

    it('should include niche-specific hashtags', () => {
      const plan = generateDemoContentPlan(testProfile, 10);
      
      const firstItem = plan.items[0];
      expect(firstItem.hashtags.some(tag => tag.toLowerCase().includes('fitness'))).toBe(true);
    });

    it('should rotate through different copywriting authors', () => {
      const plan = generateDemoContentPlan(testProfile, 10);
      
      const authors = new Set(plan.items.map(item => item.copywritingTip.author));
      expect(authors.size).toBe(3); // Hopkins, Ogilvy, Schwartz
    });
  });

  describe('generateContentPlan with LLM', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should fall back to demo plan when LLM fails', async () => {
      const { invokeLLM } = await import('../_core/llm');
      (invokeLLM as any).mockRejectedValue(new Error('LLM error'));

      const plan = await generateContentPlan(testProfile, 10);
      
      expect(plan).toBeDefined();
      expect(plan.items).toHaveLength(10);
      expect(plan.duration).toBe(10);
    });

    it('should handle successful LLM response', async () => {
      const { invokeLLM } = await import('../_core/llm');
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              items: Array.from({ length: 10 }, (_, i) => ({
                day: i + 1,
                topic: `AI Generated Topic ${i + 1}`,
                hook: `AI Generated Hook ${i + 1}`,
                framework: i % 2 === 0 ? 'HAPSS' : 'AIDA',
                scriptStructure: {
                  hook: 'Test hook',
                  hookDuration: '1-2s',
                  body: 'Test body',
                  bodyDuration: '15-20s',
                  cta: 'Test CTA',
                  ctaDuration: '3-5s'
                },
                copywritingTip: {
                  author: 'Hopkins',
                  tip: 'Test tip'
                },
                cutRecommendation: 'Test cut recommendation',
                hashtags: ['#test', '#ai', '#generated'],
                bestPostingTime: '18:00',
                estimatedViews: '50K-100K'
              }))
            })
          }
        }]
      };
      
      (invokeLLM as any).mockResolvedValue(mockLLMResponse);

      const plan = await generateContentPlan(testProfile, 10);
      
      expect(plan).toBeDefined();
      expect(plan.items).toHaveLength(10);
      expect(plan.items[0].topic).toBe('AI Generated Topic 1');
    });

    it('should validate and fill missing fields from LLM response', async () => {
      const { invokeLLM } = await import('../_core/llm');
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              items: [{
                day: 1,
                topic: 'Partial Topic',
                // Missing other fields
              }]
            })
          }
        }]
      };
      
      (invokeLLM as any).mockResolvedValue(mockLLMResponse);

      const plan = await generateContentPlan(testProfile, 10);
      
      expect(plan).toBeDefined();
      // Should have filled in missing fields with defaults
      expect(plan.items[0].hook).toBeDefined();
      expect(plan.items[0].framework).toBeDefined();
      expect(plan.items[0].scriptStructure).toBeDefined();
    });
  });

  describe('Content Plan Item Validation', () => {
    it('should have valid posting times', () => {
      const plan = generateDemoContentPlan(testProfile, 30);
      
      const validTimes = ['18:00', '19:00', '20:00', '12:00', '21:00'];
      plan.items.forEach(item => {
        expect(validTimes).toContain(item.bestPostingTime);
      });
    });

    it('should have estimated views in correct format', () => {
      const plan = generateDemoContentPlan(testProfile, 10);
      
      plan.items.forEach(item => {
        expect(item.estimatedViews).toMatch(/^\d+K-\d+K$/);
      });
    });

    it('should have 5 hashtags per item', () => {
      const plan = generateDemoContentPlan(testProfile, 10);
      
      plan.items.forEach(item => {
        expect(item.hashtags).toHaveLength(5);
        item.hashtags.forEach(tag => {
          expect(tag.startsWith('#')).toBe(true);
        });
      });
    });
  });
});
