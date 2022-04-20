import { tagsToWcagUrls } from '../tagsToWcagUrls'

describe('tagsToWcagUrls', () => {
  it('returns tags', () => {
    const urls = tagsToWcagUrls(['wcag111', 'wcag412']);
    expect(urls).toEqual([
      'WCAG2:non-text-content',
      'WCAG2:name-role-value'
    ]);
  });

  it('skips non-wcag tags', () => {
    const urls = tagsToWcagUrls([ 'wcag21a', 'wcag111', 'best-practice' ]);
    expect(urls).toEqual(['WCAG2:non-text-content']);
  });

  it('ignores invalid wcag SC tags', () => {
    const urls = tagsToWcagUrls([ 'wcag999', 'wcag111' ]);
    expect(urls).toEqual(['WCAG2:non-text-content']);
  });
});
