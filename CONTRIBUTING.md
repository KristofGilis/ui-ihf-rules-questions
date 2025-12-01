# Contributing to IHF Rules Quiz

Thank you for your interest in contributing to the IHF Rules Quiz! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## 🤝 Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Angular CLI 21+ (optional but recommended)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/ui-ihf-rules-questions.git
   cd ui-ihf-rules-questions
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start development server**:

   ```bash
   npm start
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## 💻 Development Process

### Branch Strategy

- `main` - Production-ready code
- `feat/redesign` - Current development branch
- `feat/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test improvements

### Creating a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Add tests for any new functionality
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Format code: `npm run prettier:write`

## 🔄 Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run prettier:check`)
- [ ] Test coverage remains above 95%
- [ ] E2E tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions

### Submitting a PR

1. **Push your branch** to your fork:

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Open a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of changes
   - Include screenshots for UI changes

3. **Wait for review**:
   - A maintainer will review your PR
   - Address any requested changes
   - Once approved, your PR will be merged

### PR Review Criteria

- Code quality and readability
- Test coverage
- Performance impact
- Accessibility compliance
- Security considerations
- Documentation completeness

## 📝 Coding Standards

### TypeScript

- Use strict TypeScript mode
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Avoid `any` type

### Angular

- Use **standalone components** (no NgModules)
- Use **OnPush change detection** for all components
- Use **signals** for reactive state
- Inject dependencies using `inject()` function
- Prefix private fields with `_`

### Example:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  private readonly _service = inject(ExampleService);
  readonly data = signal<Data[]>([]);

  readonly filteredData = computed(() => {
    return this.data().filter((item) => item.active);
  });
}
```

### Styling

- Use **Tailwind CSS** utility classes
- Follow **mobile-first** approach
- Ensure **dark mode** support
- Maintain **accessibility** (WCAG 2.1 AA)

## 🧪 Testing Guidelines

### Unit Tests (Jest)

- Write tests for all new components and services
- Maintain >95% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('ExampleComponent', () => {
  it('should display correct title', () => {
    // Arrange
    const fixture = TestBed.createComponent(ExampleComponent);
    const component = fixture.componentInstance;

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.title()).toBe('Expected Title');
  });
});
```

### E2E Tests (Playwright)

- Add E2E tests for critical user flows
- Test accessibility with axe-core
- Use page object pattern for reusability

```typescript
test('should complete quiz flow', async ({ page }) => {
  await page.goto('/quiz');
  await page.getByRole('button', { name: /start/i }).click();
  // ... test steps
});
```

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# Unit tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## 📨 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or fixes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```
feat(quiz): add swipe gestures for mobile navigation

Implement HammerJS swipe gestures to allow users to navigate
between quiz questions using left/right swipes on mobile devices.

Closes #123
```

```
fix(accessibility): improve screen reader support for quiz timer

Add aria-live region to quiz timer to announce time remaining
to screen reader users.
```

```
docs: update contributing guidelines

Add detailed testing guidelines and commit message conventions.
```

## 🌍 Internationalization (i18n)

### Adding Translations

1. Add translation keys to all language files:
   - `public/i18n/en.json`
   - `public/i18n/nl.json`
   - `public/i18n/srb.json`

2. Extract translations:

   ```bash
   npm run i18n:extract
   ```

3. Use translations in templates:
   ```html
   <h1>{{ 'section.title' | translate }}</h1>
   ```

### Translation Guidelines

- Use nested JSON structure
- Keep keys lowercase with underscores
- Provide context in comments for translators
- Test all languages before submitting

## 🆘 Getting Help

- 💬 Open a [GitHub Discussion](https://github.com/KristofGilis/ui-ihf-rules-questions/discussions)
- 🐛 Report bugs via [GitHub Issues](https://github.com/KristofGilis/ui-ihf-rules-questions/issues)
- 📧 Contact maintainers

## 📜 License

By contributing to IHF Rules Quiz, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🎉
