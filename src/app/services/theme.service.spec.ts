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

  it.skip('should load saved theme from localStorage', () => {
    // Clean up existing service
    TestBed.resetTestingModule();

    // Mock localStorage to return 'dark'
    mockLocalStorage = { theme: 'dark' };

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    const newService = TestBed.inject(ThemeService);
    expect(newService.currentTheme()).toBe('dark');
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
});
