import { en } from './en';
import { ms } from './ms';
import { ta } from './ta';
import { Language, Translations } from './types';
import { zh } from './zh';

export { Language, Translations };

export const translations: Record<Language, Translations> = {
  en,
  ms,
  zh,
  ta,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  ms: 'Bahasa Melayu',
  zh: '中文',
  ta: 'தமிழ்',
};

export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}
