import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { map } from 'rxjs';
import { GetQuestionsGQL, Question } from '../../../graphql/generated';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FontAwesomeModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly getQuestionsGQL = inject(GetQuestionsGQL);
  readonly quizService = inject(QuizService);

  readonly faClock = faClock;
  readonly faArrowLeft = faArrowLeft;
  readonly faArrowRight = faArrowRight;
  readonly faCheck = faCheck;

  loading = true;
  selectedAnswers: Set<string> = new Set();

  ngOnInit() {
    const count = Number(this.route.snapshot.queryParams['count']) || 10;
    const timed = this.route.snapshot.queryParams['timed'] === 'true';

    // Fetch random questions
    this.getQuestionsGQL
      .watch({
        variables: {
          first: count,
          random: true,
        },
      })
      .valueChanges.pipe(
        onlyCompleteData(),
        map((result) => result.data.questions?.edges?.map((edge) => edge?.node as Question) || [])
      )
      .subscribe((questions) => {
        if (questions.length > 0) {
          this.quizService.initializeQuiz(questions, timed);
          this.loading = false;
        }
      });
  }

  ngOnDestroy() {
    this.quizService.resetQuiz();
  }

  toggleAnswer(answerId: string) {
    if (this.selectedAnswers.has(answerId)) {
      this.selectedAnswers.delete(answerId);
    } else {
      this.selectedAnswers.add(answerId);
    }
    this.quizService.answerCurrentQuestion(Array.from(this.selectedAnswers));
  }

  goToNext() {
    this.quizService.nextQuestion();
    this.loadCurrentAnswers();
  }

  goToPrevious() {
    this.quizService.previousQuestion();
    this.loadCurrentAnswers();
  }

  completeQuiz() {
    const result = this.quizService.completeQuiz();
    this.router.navigate(['/quiz/results'], { state: { result } });
  }

  private loadCurrentAnswers() {
    const currentAnswers = this.quizService.getCurrentAnswerIds();
    this.selectedAnswers = new Set(currentAnswers);
  }

  formatTime(seconds: number): string {
    return this.quizService.formatTime(seconds);
  }
}
