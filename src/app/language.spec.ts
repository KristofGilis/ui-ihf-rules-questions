import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { getLanguage } from './language';

describe('getLanguage', () => {
  let mockDocument: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    };

    mockDocument = {
      defaultView: {
        localStorage: mockLocalStorage,
      },
    };

    TestBed.configureTestingModule({
      providers: [provideTranslateService(), { provide: DOCUMENT, useValue: mockDocument }],
    });
  });

  it('should return language from localStorage if available', () => {
    mockLocalStorage.getItem.mockReturnValue('nl');
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('nl');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('language');
  });

  it('should return browser language if localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('en');
  });

  it('should map Serbian browser language (sr) to srb', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('sr');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('srb');
  });

  it('should map Serbian browser language (sr-RS) to srb', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('sr-RS');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('srb');
  });

  it('should return Dutch browser language', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('nl');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('nl');
  });

  it('should return fallback language for unsupported browser language', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('fr');
    jest.spyOn(translateService, 'getFallbackLang').mockReturnValue('en');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('en');
  });

  it('should default to en if no localStorage, browser lang, or fallback', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue(undefined);
    jest.spyOn(translateService, 'getFallbackLang').mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('en');
  });

  it('should handle missing localStorage gracefully', () => {
    mockDocument.defaultView = null;
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('en');
  });

  it('should prioritize localStorage over browser language', () => {
    mockLocalStorage.getItem.mockReturnValue('srb');

    const result = TestBed.runInInjectionContext(() => getLanguage());

    expect(result).toBe('srb');
    // localStorage is checked first, so we don't need to call getBrowserLang
    // However, the function may still call it - that's okay
  });
});
