import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { QuestionComponent } from '../questions/questions-view/components/question/question.component';
import { EmptyStateComponent, PageContainerComponent, PageHeroComponent } from '../shared/components';
import { QuestionSkeletonComponent } from './components/question-skeleton/question-skeleton.component';
import { SearchQuestionsService } from './services/search-questions.service';

@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
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

  readonly searchTerm = signal('');
  readonly loading = this._searchService.loading;
  readonly hasNextPage = this._searchService.hasNextPage;
  readonly questions = this._searchService.questions;
  /** Number of skeleton placeholder cards shown while a search is loading. */
  protected readonly skeletonPlaceholders = [0, 1, 2];

  readonly faMagnifyingGlass = faMagnifyingGlass;
  readonly faQuestionCircle = faQuestionCircle;

  private readonly _termSubject = new Subject<string>();

  constructor() {
    this._termSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this._searchService.search(term));
  }

  onSearchTermChange(term: string): void {
    this.searchTerm.set(term);
    this._termSubject.next(term);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.loading()) {
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
