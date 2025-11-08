import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Rule } from '../../../graphql/generated';
import { RulesComponent } from './rules.component';
import { RulesService } from './services/rules.service';

describe('RulesComponent', () => {
  let component: RulesComponent;
  let fixture: ComponentFixture<RulesComponent>;
  let rulesService: jest.Mocked<RulesService>;
  let translateService: TranslateService;
  let langChangeSubject: Subject<any>;

  const mockRules: Rule[] = [
    {
      id: '1',
      number: '1.1',
      name: 'Test Rule 1',
    },
    {
      id: '2',
      number: '2.3',
      name: 'Test Rule 2',
    },
  ];

  beforeEach(async () => {
    langChangeSubject = new Subject();

    const rulesServiceMock = {
      loading$: of(false),
      rules$: of({
        data: {
          rules: {
            edges: mockRules.map((rule) => ({ node: rule })),
          },
        },
        dataState: 'complete' as const,
        loading: false,
        networkStatus: 7,
        partial: false,
      }),
      refetch: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RulesComponent],
      providers: [provideTranslateService(), provideRouter([]), { provide: RulesService, useValue: rulesServiceMock }],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'onLangChange', 'get').mockReturnValue(langChangeSubject.asObservable());

    rulesService = TestBed.inject(RulesService) as jest.Mocked<RulesService>;
    fixture = TestBed.createComponent(RulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Observable Properties', () => {
    it('should expose loading$ from RulesService', (done) => {
      component.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });

    it('should transform rules$ into Rule array', (done) => {
      component.rules$.subscribe((rules) => {
        expect(rules).toHaveLength(2);
        expect(rules[0]).toEqual(mockRules[0]);
        expect(rules[1]).toEqual(mockRules[1]);
        done();
      });
    });

    it('should map rule edges to Rule objects', (done) => {
      component.rules$.subscribe((rules) => {
        expect(rules.every((rule) => rule.id && rule.number)).toBe(true);
        done();
      });
    });
  });

  describe('Language Change', () => {
    it('should refetch rules when language changes', () => {
      expect(rulesService.refetch).not.toHaveBeenCalled();

      langChangeSubject.next({ lang: 'nl', translations: {} });

      expect(rulesService.refetch).toHaveBeenCalledTimes(1);
    });

    it('should refetch rules on multiple language changes', () => {
      langChangeSubject.next({ lang: 'nl', translations: {} });
      langChangeSubject.next({ lang: 'en', translations: {} });
      langChangeSubject.next({ lang: 'srb', translations: {} });

      expect(rulesService.refetch).toHaveBeenCalledTimes(3);
    });
  });
});
