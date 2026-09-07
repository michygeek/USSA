import { describe, expect, it } from 'vitest';
import { slugify } from '@/slugify';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Secure the City')).toBe('secure-the-city');
  });

  it('collapses repeated separators', () => {
    expect(slugify('Corrections   Safety!!')).toBe('corrections-safety');
  });

  it('strips leading and trailing separators', () => {
    expect(slugify('  -Law Enforcement- ')).toBe('law-enforcement');
  });

  it('leaves an already-clean slug unchanged', () => {
    expect(slugify('security-officer-certification')).toBe('security-officer-certification');
  });
});
