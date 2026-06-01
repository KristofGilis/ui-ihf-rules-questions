import { Pipe, type PipeTransform } from '@angular/core';
import { parseTranslations } from './parse-translations.function';

@Pipe({
  name: 'appPhraseTranslation',
})
export class PhraseTranslationPipe implements PipeTransform {
  transform(phrase: string | null | undefined, translations: unknown, language: string | null | undefined): string {
    const parsed = parseTranslations(translations as string | Record<string, string> | null | undefined);
    if (language && parsed[language]) {
      return parsed[language];
    }
    return phrase ?? '';
  }
}
