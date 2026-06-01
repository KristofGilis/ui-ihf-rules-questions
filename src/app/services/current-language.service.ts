import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

/**
 * Exposes the currently active i18n language as a signal so components can
 * reactively re-render content fields that are kept locally in a
 * `translations` JSON blob (e.g. Rule.name, Question.phrase, Answer.phrase).
 */
@Injectable({ providedIn: 'root' })
export class CurrentLanguageService {
  private readonly _translate = inject(TranslateService);

  readonly current: Signal<string> = toSignal(this._translate.onLangChange.pipe(map((event) => event.lang)), {
    initialValue: this._translate.getCurrentLang() ?? this._translate.getFallbackLang() ?? 'en',
  });
}
