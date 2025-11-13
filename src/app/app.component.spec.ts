import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let translateService: TranslateService;
  let themeService: ThemeService;
  let titleService: Title;
  let langChangeSubject: Subject<any>;

  beforeEach(async () => {
    langChangeSubject = new Subject();

    const themeServiceMock = {
      currentTheme: jest.fn(() => 'light'),
      setTheme: jest.fn(),
    };

    const swUpdateMock = {
      isEnabled: false,
      versionUpdates: { subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })) } as any,
      checkForUpdate: jest.fn().mockResolvedValue(true),
      activateUpdate: jest.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: SwUpdate, useValue: swUpdateMock },
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    themeService = TestBed.inject(ThemeService);
    titleService = TestBed.inject(Title);

    // Mock translate service methods
    jest.spyOn(translateService, 'addLangs');
    jest.spyOn(translateService, 'use').mockReturnValue(new Subject<any>().asObservable());
    jest.spyOn(translateService, 'instant').mockReturnValue('Mocked Title');
    Object.defineProperty(translateService, 'onLangChange', {
      value: langChangeSubject.asObservable(),
      writable: true,
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should add supported languages', () => {
      expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'nl', 'srb']);
    });

    it('should set initial language', () => {
      expect(translateService.use).toHaveBeenCalled();
    });

    it('should update document title on language change', () => {
      const setTitleSpy = jest.spyOn(titleService, 'setTitle');

      langChangeSubject.next({ lang: 'nl' });

      expect(translateService.instant).toHaveBeenCalledWith('main.title');
      expect(setTitleSpy).toHaveBeenCalledWith('Mocked Title');
    });
  });

  describe('onChangeLanguage', () => {
    it('should update localStorage', () => {
      const mockLocalStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      component.onChangeLanguage('nl');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'nl');
    });

    it('should change translate service language', () => {
      component.onChangeLanguage('nl');

      expect(translateService.use).toHaveBeenCalledWith('nl');
    });

    it('should update current language signal', () => {
      component.onChangeLanguage('nl');

      expect(component['currentLang']()).toBe('nl');
    });

    it('should update document lang attribute', () => {
      component.onChangeLanguage('srb');

      expect(document.documentElement.lang).toBe('srb');
    });
  });

  describe('toggleLanguageMenu', () => {
    it('should toggle language menu', () => {
      const initialValue = component['showLanguageMenu']();
      component.toggleLanguageMenu();

      expect(component['showLanguageMenu']()).toBe(!initialValue);
    });
  });

  describe('selectLanguage', () => {
    it('should change language', () => {
      const onChangeLanguageSpy = jest.spyOn(component, 'onChangeLanguage');

      component.selectLanguage('nl');

      expect(onChangeLanguageSpy).toHaveBeenCalledWith('nl');
    });

    it('should close language menu', () => {
      component['showLanguageMenu'].set(true);

      component.selectLanguage('nl');

      expect(component['showLanguageMenu']()).toBe(false);
    });
  });

  describe('onDocumentClick', () => {
    it('should close language menu when clicking outside', () => {
      component['showLanguageMenu'].set(true);

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: document.createElement('div'),
        writable: false,
      });

      component.onDocumentClick(event);

      expect(component['showLanguageMenu']()).toBe(false);
    });

    it('should not close language menu when clicking inside', () => {
      component['showLanguageMenu'].set(true);

      const languageDiv = document.createElement('div');
      languageDiv.className = 'language-dropdown';
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: languageDiv,
        writable: false,
      });

      component.onDocumentClick(event);

      expect(component['showLanguageMenu']()).toBe(true);
    });

    it('should close theme menu when clicking outside', () => {
      component['showThemeMenu'].set(true);

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: document.createElement('div'),
        writable: false,
      });

      component.onDocumentClick(event);

      expect(component['showThemeMenu']()).toBe(false);
    });

    it('should not close theme menu when clicking inside', () => {
      component['showThemeMenu'].set(true);

      const themeDiv = document.createElement('div');
      themeDiv.className = 'theme-dropdown';
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: themeDiv,
        writable: false,
      });

      component.onDocumentClick(event);

      expect(component['showThemeMenu']()).toBe(true);
    });

    it('should not close menus when they are already closed', () => {
      component['showLanguageMenu'].set(false);
      component['showThemeMenu'].set(false);

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: document.createElement('div'),
        writable: false,
      });

      // Should not throw
      expect(() => component.onDocumentClick(event)).not.toThrow();
    });
  });

  describe('toggleThemeMenu', () => {
    it('should toggle theme menu', () => {
      const initialValue = component['showThemeMenu']();
      component.toggleThemeMenu();

      expect(component['showThemeMenu']()).toBe(!initialValue);
    });
  });

  describe('selectTheme', () => {
    it('should set theme in service', () => {
      component.selectTheme('dark');

      expect(themeService.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should update current theme signal', () => {
      component.selectTheme('dark');

      expect(component['currentTheme']()).toBe('dark');
    });

    it('should close theme menu', () => {
      component['showThemeMenu'].set(true);

      component.selectTheme('light');

      expect(component['showThemeMenu']()).toBe(false);
    });

    it('should handle system theme', () => {
      component.selectTheme('system');

      expect(themeService.setTheme).toHaveBeenCalledWith('system');
      expect(component['currentTheme']()).toBe('system');
    });
  });

  describe('computed signals', () => {
    it('should compute themeIcon for light theme', () => {
      component['currentTheme'].set('light');

      expect(component['themeIcon']()).toBe(component['faSun']);
    });

    it('should compute themeIcon for dark theme', () => {
      component['currentTheme'].set('dark');

      expect(component['themeIcon']()).toBe(component['faMoon']);
    });

    it('should compute themeIcon for system theme', () => {
      component['currentTheme'].set('system');

      expect(component['themeIcon']()).toBe(component['faDesktop']);
    });

    it('should compute themeLabel for light theme', () => {
      component['currentTheme'].set('light');

      expect(component['themeLabel']()).toBe('theme.light');
    });

    it('should compute themeLabel for dark theme', () => {
      component['currentTheme'].set('dark');

      expect(component['themeLabel']()).toBe('theme.dark');
    });

    it('should compute themeLabel for system theme', () => {
      component['currentTheme'].set('system');

      expect(component['themeLabel']()).toBe('theme.system');
    });
  });
});
