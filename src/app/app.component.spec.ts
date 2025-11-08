import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ActionSheet } from '@capacitor/action-sheet';
import { Capacitor } from '@capacitor/core';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';

// Mock Capacitor
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
  },
}));

// Mock ActionSheet
jest.mock('@capacitor/action-sheet', () => ({
  ActionSheet: {
    showActions: jest.fn(),
  },
}));

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

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideTranslateService(), { provide: ThemeService, useValue: themeServiceMock }],
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
    it('should toggle language menu on desktop', () => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(false);
      Object.defineProperty(component, 'isNativePlatform', { value: false, writable: true });

      const initialValue = component['showLanguageMenu']();
      component.toggleLanguageMenu();

      expect(component['showLanguageMenu']()).toBe(!initialValue);
    });

    it('should show action sheet on native platform', () => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
      Object.defineProperty(component, 'isNativePlatform', { value: true, writable: true });
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: -1 });

      component.toggleLanguageMenu();

      expect(ActionSheet.showActions).toHaveBeenCalledWith({
        title: 'Mocked Title',
        options: [{ title: 'Mocked Title' }, { title: 'Mocked Title' }, { title: 'Mocked Title' }],
      });
    });
  });

  describe('showLanguageActionSheet', () => {
    beforeEach(() => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
      Object.defineProperty(component, 'isNativePlatform', { value: true, writable: true });
    });

    it('should change language when option selected', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: 1 });

      component.toggleLanguageMenu();
      // Wait for async action sheet to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component['currentLang']()).toBe('nl');
      expect(document.documentElement.lang).toBe('nl');
    });

    it('should not change language when cancelled', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: -1 });
      const currentLang = component['currentLang']();

      component.toggleLanguageMenu();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component['currentLang']()).toBe(currentLang);
    });

    it('should handle first language option', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: 0 });

      component.toggleLanguageMenu();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component['currentLang']()).toBe('en');
    });

    it('should handle last language option', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: 2 });

      component.toggleLanguageMenu();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component['currentLang']()).toBe('srb');
      expect(document.documentElement.lang).toBe('srb');
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
    it('should toggle theme menu on desktop', () => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(false);
      Object.defineProperty(component, 'isNativePlatform', { value: false, writable: true });

      const initialValue = component['showThemeMenu']();
      component.toggleThemeMenu();

      expect(component['showThemeMenu']()).toBe(!initialValue);
    });

    it('should show action sheet on native platform', async () => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
      Object.defineProperty(component, 'isNativePlatform', { value: true, writable: true });
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: -1 });

      await component.toggleThemeMenu();

      expect(ActionSheet.showActions).toHaveBeenCalledWith({
        title: 'Mocked Title',
        options: [{ title: 'Mocked Title' }, { title: 'Mocked Title' }, { title: 'Mocked Title' }],
      });
    });
  });

  describe('showThemeActionSheet', () => {
    beforeEach(() => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
      Object.defineProperty(component, 'isNativePlatform', { value: true, writable: true });
      // Reset theme service mock calls
      (themeService.setTheme as jest.Mock).mockClear();
    });

    it('should set light theme when first option selected', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: 0 });

      component.toggleThemeMenu();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(themeService.setTheme).toHaveBeenCalledWith('light');
      expect(component['currentTheme']()).toBe('light');
    });

    it('should set dark theme when second option selected', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: 1 });

      component.toggleThemeMenu();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(themeService.setTheme).toHaveBeenCalledWith('dark');
      expect(component['currentTheme']()).toBe('dark');
    });

    it('should set system theme when third option selected', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: 2 });

      component.toggleThemeMenu();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(themeService.setTheme).toHaveBeenCalledWith('system');
      expect(component['currentTheme']()).toBe('system');
    });

    it('should not change theme when cancelled', async () => {
      (ActionSheet.showActions as jest.Mock).mockResolvedValue({ index: -1 });

      component.toggleThemeMenu();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(themeService.setTheme).not.toHaveBeenCalled();
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
