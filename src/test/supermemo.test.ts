import { describe, it, expect } from 'vitest';
import { supermemo, calculateNextReviewDate, isDue, DEFAULT_SUPERMEMO_ITEM } from '../lib/supermemo';
import type { SuperMemoItem, SuperMemoGrade } from '../lib/supermemo';

describe('SuperMemo algorithm', () => {
  describe('supermemo function', () => {
    it('should initialize correctly with default values', () => {
      const item: SuperMemoItem = { ...DEFAULT_SUPERMEMO_ITEM };
      
      expect(item.interval).toBe(0);
      expect(item.repetition).toBe(0);
      expect(item.efactor).toBe(2.5);
    });
    
    it('should reset repetition and set interval to 1 for grade < 3', () => {
      const item: SuperMemoItem = { interval: 10, repetition: 5, efactor: 2.1 };
      
      const result = supermemo(item, 2);
      
      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
      // EF should be updated even for grade < 3
      expect(result.efactor).toBeLessThan(item.efactor);
    });
    
    it('should set interval to 1 for the first correct response', () => {
      const item: SuperMemoItem = { interval: 0, repetition: 0, efactor: 2.5 };
      
      const result = supermemo(item, 3);
      
      expect(result.repetition).toBe(1);
      expect(result.interval).toBe(1);
    });
    
    it('should set interval to 6 for the second correct response', () => {
      const item: SuperMemoItem = { interval: 1, repetition: 1, efactor: 2.5 };
      
      const result = supermemo(item, 4);
      
      expect(result.repetition).toBe(2);
      expect(result.interval).toBe(6);
    });
    
    it('should calculate the right interval for repetitions > 2', () => {
      const item: SuperMemoItem = { interval: 6, repetition: 2, efactor: 2.5 };
      
      const result = supermemo(item, 5);
      
      expect(result.repetition).toBe(3);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
    });
    
    it('should increase efactor for good responses', () => {
      const item: SuperMemoItem = { interval: 0, repetition: 0, efactor: 2.5 };
      
      const result = supermemo(item, 5);
      
      expect(result.efactor).toBeGreaterThan(item.efactor);
    });
    
    it('should decrease efactor for poor responses', () => {
      const item: SuperMemoItem = { interval: 0, repetition: 0, efactor: 2.5 };
      
      const result = supermemo(item, 0);
      
      expect(result.efactor).toBeLessThan(item.efactor);
    });
    
    it('should not let efactor go below 1.3', () => {
      const item: SuperMemoItem = { interval: 0, repetition: 0, efactor: 1.4 };
      
      const result = supermemo(item, 0);
      
      expect(result.efactor).toBe(1.3);
    });
    
    it('should follow a sequence of learning through multiple reviews', () => {
      // Start with a new item
      let item: SuperMemoItem = { ...DEFAULT_SUPERMEMO_ITEM };
      
      // First review - grade 4 (good)
      item = supermemo(item, 4);
      expect(item.repetition).toBe(1);
      expect(item.interval).toBe(1);
      
      // Second review after 1 day - grade 5 (perfect)
      item = supermemo(item, 5);
      expect(item.repetition).toBe(2);
      expect(item.interval).toBe(6);
      
      // Third review after 6 days - grade 3 (difficult but correct)
      const efactorBeforeThird = item.efactor;
      item = supermemo(item, 3);
      expect(item.repetition).toBe(3);
      expect(item.interval).toBeGreaterThan(6);
      expect(item.efactor).toBeLessThan(efactorBeforeThird); // EF decreased due to difficulty
      
      // Fourth review - grade 2 (wrong) - should reset
      const intervalBefore = item.interval;
      item = supermemo(item, 2);
      expect(item.repetition).toBe(0);
      expect(item.interval).toBe(1);
    });
  });
  
  describe('calculateNextReviewDate', () => {
    it('should calculate the next review date correctly', () => {
      const today = new Date(2023, 0, 1); // Jan 1, 2023
      const interval = 6;
      
      const nextDate = calculateNextReviewDate(interval, today);
      
      expect(nextDate.getDate()).toBe(7); // Jan 7, 2023
      expect(nextDate.getMonth()).toBe(0);
      expect(nextDate.getFullYear()).toBe(2023);
    });
    
    it('should handle month/year boundaries', () => {
      const today = new Date(2023, 11, 30); // Dec 30, 2023
      const interval = 5;
      
      const nextDate = calculateNextReviewDate(interval, today);
      
      expect(nextDate.getDate()).toBe(4);
      expect(nextDate.getMonth()).toBe(0); // January
      expect(nextDate.getFullYear()).toBe(2024);
    });
  });
  
  describe('isDue', () => {
    it('should return true for null or undefined date', () => {
      expect(isDue(null)).toBe(true);
    });
    
    it('should return true for dates in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      
      expect(isDue(pastDate)).toBe(true);
    });
    
    it('should return false for dates in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      
      expect(isDue(futureDate)).toBe(false);
    });
    
    it('should handle string dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(isDue(yesterday.toISOString())).toBe(true);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(isDue(tomorrow.toISOString())).toBe(false);
    });
  });
}); 