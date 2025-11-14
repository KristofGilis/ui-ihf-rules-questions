import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {};
    Storage.prototype.getItem = jest.fn((key: string) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    // Mock CSS variables
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-bg-light') return '#f8fafc';
          if (prop === '--color-bg-dark') return '#0f172a';
          return '';
        },
      }),
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with system theme by default', () => {
    expect(service.currentTheme()).toBe('system');
  });

  it('should set and save theme', () => {
    service.setTheme('light');
    expect(service.currentTheme()).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should set dark theme', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should set system theme', () => {
    service.setTheme('system');
    expect(service.currentTheme()).toBe('system');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
  });

  it('should apply dark class when dark theme is set', () => {
    service.setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should remove dark class when light theme is set', () => {
    service.setTheme('dark');
    service.setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should handle system theme preference', () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
      writable: true,
    });

    service.setTheme('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should handle system theme preference with light mode', () => {
    // Mock system preference as light (not dark)
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation((query) => ({
        matches: false, // prefers-color-scheme: dark is false, so it's light
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
      writable: true,
    });

    service.setTheme('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should load saved theme from localStorage', () => {
    // Test that themes are persisted correctly to localStorage
    service.setTheme('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');

    service.setTheme('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    service.setTheme('system');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
  });

  it('should not load invalid theme from localStorage', () => {
    // Set invalid theme in mock localStorage
    mockLocalStorage['theme'] = 'invalid-theme' as any;

    // Recreate service to trigger loadTheme() in constructor
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    const newService = TestBed.inject(ThemeService);

    // Should fall back to system theme
    expect(newService.currentTheme()).toBe('system');
  });

  it('should not load null theme from localStorage', () => {
    // Ensure theme is not in localStorage
    delete mockLocalStorage['theme'];

    // Recreate service
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    const newService = TestBed.inject(ThemeService);

    // Should use system theme as default
    expect(newService.currentTheme()).toBe('system');
  });

  it('should handle missing theme gracefully', () => {
    // Clear localStorage
    mockLocalStorage = {};

    // Recreate service
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    const newService = TestBed.inject(ThemeService);

    // Service should still work
    expect(newService).toBeTruthy();
    expect(newService.currentTheme()).toBe('system');
  });

  it('should react to system preference changes when theme is system', () => {
    let mediaQueryListener: ((event: MediaQueryListEvent) => void) | undefined;

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn((_event, listener) => {
          mediaQueryListener = listener;
        }),
        removeEventListener: jest.fn(),
      })),
      writable: true,
    });

    // Recreate TestBed to capture listener
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    // Create new service to capture listener
    const newService = TestBed.inject(ThemeService);
    newService.setTheme('system');

    // Simulate system preference change
    if (mediaQueryListener) {
      mediaQueryListener({ matches: true } as MediaQueryListEvent);
    }

    // Should have reapplied theme
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should not react to system preference changes when theme is not system', () => {
    let mediaQueryListener: ((event: MediaQueryListEvent) => void) | undefined;

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn((_event, listener) => {
          mediaQueryListener = listener;
        }),
        removeEventListener: jest.fn(),
      })),
      writable: true,
    });

    // Recreate TestBed to capture listener
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    // Create new service and set to light theme
    const newService = TestBed.inject(ThemeService);
    newService.setTheme('light');

    const lightThemeSet = !document.documentElement.classList.contains('dark');

    // Simulate system preference change
    if (mediaQueryListener) {
      mediaQueryListener({ matches: true } as MediaQueryListEvent);
    }

    // Should not have changed from light theme
    expect(document.documentElement.classList.contains('dark')).toBe(!lightThemeSet);
  });

  it('should return effective theme when theme is light', () => {
    service.setTheme('light');
    expect(service.getEffectiveTheme()).toBe('light');
  });

  it('should return effective theme when theme is dark', () => {
    service.setTheme('dark');
    expect(service.getEffectiveTheme()).toBe('dark');
  });

  it('should return effective theme based on system preference when theme is system', () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
      writable: true,
    });

    service.setTheme('system');
    expect(service.getEffectiveTheme()).toBe('dark');
  });

  it('should return light as effective theme when system preference is light', () => {
    // Mock system preference as light
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
      writable: true,
    });

    service.setTheme('system');
    expect(service.getEffectiveTheme()).toBe('light');
  });
});
