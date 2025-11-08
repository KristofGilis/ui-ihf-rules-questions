# ADR-001: Use Signals Instead of NgRx for State Management

**Date**: 2024-11-08  
**Status**: Accepted  
**Deciders**: Development Team  
**Technical Story**: Application state management architecture

## Context and Problem Statement

We need a state management solution for the IHF Rules Quiz application. The main state requirements are:

- Quiz session state (current question, answers, timer)
- Theme preferences (light/dark/system)
- Language selection
- Questions and rules data from GraphQL API

Options considered:

1. NgRx (Redux pattern)
2. Angular Services with RxJS
3. Angular Signals (Angular 16+)
4. Akita
5. NGXS

## Decision Drivers

- Application complexity (relatively simple, single-page app)
- Bundle size constraints
- Developer experience
- Performance requirements
- Team familiarity with patterns
- Future Angular direction

## Considered Options

### Option 1: NgRx

**Pros:**

- Industry standard for Angular
- Excellent DevTools
- Strong typing
- Time-travel debugging
- Great for large, complex apps

**Cons:**

- Significant boilerplate
- Steep learning curve
- Large bundle size impact (~50KB)
- Overkill for app of this size
- Requires understanding of Redux patterns

### Option 2: Angular Services with RxJS

**Pros:**

- No additional dependencies
- Familiar to Angular developers
- Flexible
- Well-documented

**Cons:**

- Requires careful subscription management
- Can lead to memory leaks if not handled properly
- More manual work for computed values
- Not aligned with Angular's future direction

### Option 3: Angular Signals ✅

**Pros:**

- Native Angular feature (future of Angular)
- Zero additional bundle size
- Automatic change detection optimization
- Built-in computed values (memoized)
- Fine-grained reactivity
- Simple, intuitive API
- No subscription management needed
- Excellent performance

**Cons:**

- Relatively new (Angular 16+)
- Limited ecosystem/tooling
- Some features still in developer preview

## Decision Outcome

**Chosen option:** "Angular Signals" because:

1. **Perfect fit for app complexity**: Our state needs are relatively simple (quiz state, preferences, API data). Signals provide exactly what we need without unnecessary complexity.

2. **Performance**: Signals enable fine-grained reactivity, updating only what changed. This is perfect for our quiz timer and real-time updates.

3. **Bundle size**: Zero additional bytes. NgRx would add ~50KB, which is significant for our target bundle size.

4. **Future-proof**: Angular is moving towards signals as the primary reactive primitive. Using signals now aligns with Angular's roadmap.

5. **Developer experience**: Simple, intuitive API:

   ```typescript
   const count = signal(0);
   const doubled = computed(() => count() * 2);
   count.set(5); // doubled automatically updates to 10
   ```

6. **Interoperability**: Works seamlessly with RxJS (via `toSignal()` and `toObservable()`), allowing us to use Apollo Client observables easily.

## Implementation Examples

### Quiz State

```typescript
export class QuizService {
  readonly config = signal<QuizConfig | null>(null);
  readonly state = signal<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false,
  });

  readonly currentQuestion = computed(() => {
    const cfg = this.config();
    const st = this.state();
    return cfg?.questions[st.currentQuestionIndex];
  });

  nextQuestion(): void {
    this.state.update((s) => ({
      ...s,
      currentQuestionIndex: s.currentQuestionIndex + 1,
    }));
  }
}
```

### Theme State

```typescript
export class ThemeService {
  private readonly _currentTheme = signal<Theme>('system');
  readonly currentTheme = this._currentTheme.asReadonly();

  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }
}
```

### Apollo Integration

```typescript
// Using toSignal to convert Apollo observables
const questions = toSignal(this._questionsGQL.watch().valueChanges.pipe(map((result) => result.data.questions)));
```

## Consequences

### Positive

- ✅ Smaller bundle size (no state management library needed)
- ✅ Better performance (fine-grained reactivity)
- ✅ Simpler code (less boilerplate)
- ✅ Automatic change detection optimization
- ✅ Future-proof (aligned with Angular's direction)
- ✅ No subscription management

### Negative

- ⚠️ Limited tooling (no Redux DevTools equivalent)
- ⚠️ Relatively new (less Stack Overflow answers)
- ⚠️ Some team members need to learn signals API

### Neutral

- 🔄 Can migrate to NgRx later if complexity increases
- 🔄 Signals can interoperate with RxJS for gradual migration

## Validation

After implementing signals across the application:

- **Bundle size**: Main bundle is 294KB (raw), 84KB (gzipped)
- **Performance**: Change detection optimized automatically
- **Code quality**: Simpler, more readable code
- **Test coverage**: 97.52% (signals are easily testable)

## Related Decisions

- [ADR-002](./ADR-002-apollo-client.md) - Using Apollo Client for GraphQL (works well with signals via `toSignal()`)
- OnPush change detection strategy (complements signals)

## References

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Angular Future with Signals](https://blog.angular.io/angular-v16-is-here-4d7a28ec680d)
- [NgRx vs Signals Comparison](https://dev.to/this-is-angular/angular-signals-vs-ngrx-3gpj)
