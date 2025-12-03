import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appPhraseTranslation',
})
export class PhraseTranslationPipe implements PipeTransform {
  transform(phrase: string, translations: Record<string, string>, language: string): string {
    return translations[language] ?? phrase ?? '';
  }
}
