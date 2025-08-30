import { cn } from '../utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toContain('class1');
      expect(cn('class1', 'class2')).toContain('class2');
    });

    it('handles conditional classes', () => {
      expect(cn('class1', false && 'class2')).toBe('class1');
      expect(cn('class1', true && 'class2')).toContain('class1');
      expect(cn('class1', true && 'class2')).toContain('class2');
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });
  });
});