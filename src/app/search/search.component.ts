import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faQuestionCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { QuestionComponent } from '../questions/questions-view/components/question/question.component';
import { EmptyStateComponent, PageContainerComponent, PageHeroComponent } from '../shared/components';
import { QuestionSkeletonComponent } from './components/question-skeleton/question-skeleton.component';
import { SearchQuestionsService } from './services/search-questions.service';

@Component({
  selector: 'app-search',
  imports: [
    FormField,
    FaIconComponent,
    TranslatePipe,
    QuestionComponent,
    EmptyStateComponent,
    QuestionSkeletonComponent,
    PageContainerComponent,
    PageHeroComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private readonly _searchService = inject(SearchQuestionsService);

  readonly searchForm = form(signal(''));
  readonly loading = this._searchService.loading;
  readonly hasNextPage = this._searchService.hasNextPage;
  readonly questions = this._searchService.questions;
  /** Number of skeleton placeholder cards shown while a search is loading. */
  protected readonly skeletonPlaceholders = [0, 1, 2];

  readonly faMagnifyingGlass = faMagnifyingGlass;
  readonly faQuestionCircle = faQuestionCircle;
  readonly faXmark = faXmark;

  constructor() {
    toObservable(this.searchForm().value)
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this._searchService.search(term));
  }

  clearSearch(): void {
    this.searchForm().value.set('');
    this.searchForm().formFieldBindings()[0]?.focus();
  }

  // Mobile keyboard close/open resizes the viewport and fires scroll events; without this guard that
  // spuriously triggers fetchMore() and makes it look like the results changed.
  private _lastInnerHeight = window.innerHeight;

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.loading()) {
      return;
    }

    if (window.innerHeight !== this._lastInnerHeight) {
      this._lastInnerHeight = window.innerHeight;
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 200; // pixels from bottom

    if (scrollPosition >= documentHeight - threshold && this.hasNextPage()) {
      this._searchService.fetchMore();
    }
  }
}
