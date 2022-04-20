import wcag from './wcag.json';

const wcagSpec = wcag as unknown as Record<string, { scId: string }>

export function tagsToWcagUrls(
  tags: string[]
): string[] {
  const scTags = tags.filter(tag => tag.match(/^wcag[0-9]{3,4}$/));
  const scNums = scTags.map(scTag => `${scTag[4]}.${scTag[5]}.${scTag.substr(6)}`);
  const scUrls = scNums.map(scNum => wcagSpec[scNum]?.scId);
  return scUrls.filter(scUrl => scUrl);
}
