import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-question-skeleton',
  templateUrl: './question-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionSkeletonComponent {}
