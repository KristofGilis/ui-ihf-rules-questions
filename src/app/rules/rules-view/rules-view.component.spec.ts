import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Rule } from '../../../../graphql/generated';
import { RulesViewComponent } from './rules-view.component';

describe('RulesViewComponent', () => {
  let component: RulesViewComponent;
  let fixture: ComponentFixture<RulesViewComponent>;

  const mockRules: Rule[] = [
    {
      __typename: 'Rule',
      id: '1',
      number: '1',
      name: 'Rule 1',
    },
    {
      __typename: 'Rule',
      id: '2',
      number: '2',
      name: 'Rule 2',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesViewComponent],
      providers: [provideTranslateService(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RulesViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept rules input', () => {
      fixture.componentRef.setInput('rules', mockRules);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      expect(component.rules()).toEqual(mockRules);
    });

    it('should accept loading input', () => {
      fixture.componentRef.setInput('rules', []);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(component.loading()).toBe(true);
    });

    it('should accept loading false', () => {
      fixture.componentRef.setInput('rules', mockRules);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      expect(component.loading()).toBe(false);
    });

    it('should handle empty rules array', () => {
      fixture.componentRef.setInput('rules', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      expect(component.rules()).toEqual([]);
    });

    it('should handle large rules array', () => {
      const largeRules: Rule[] = Array.from({ length: 100 }, (_, i) => ({
        __typename: 'Rule',
        id: `${i + 1}`,
        number: `${i + 1}`,
        name: `Rule ${i + 1}`,
      }));

      fixture.componentRef.setInput('rules', largeRules);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      expect(component.rules().length).toBe(100);
    });
  });

  describe('FontAwesome Icons', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('rules', mockRules);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
    });

    it('should have faChevronRight icon defined', () => {
      expect(component.faChevronRight).toBeDefined();
      expect(component.faChevronRight.iconName).toBe('chevron-right');
    });

    it('should have faFileAlt icon defined', () => {
      expect(component.faFileAlt).toBeDefined();
      expect(component.faFileAlt.iconName).toBe('file-lines');
    });
  });

  describe('Component Configuration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('rules', mockRules);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
    });

    it('should be standalone component', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle loading state with empty rules', () => {
      fixture.componentRef.setInput('rules', []);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(component.rules()).toEqual([]);
      expect(component.loading()).toBe(true);
    });

    it('should handle loaded state with rules', () => {
      fixture.componentRef.setInput('rules', mockRules);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      expect(component.rules()).toEqual(mockRules);
      expect(component.loading()).toBe(false);
    });

    it('should update when rules change', () => {
      fixture.componentRef.setInput('rules', [mockRules[0]]);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      expect(component.rules().length).toBe(1);

      fixture.componentRef.setInput('rules', mockRules);
      fixture.detectChanges();

      expect(component.rules().length).toBe(2);
    });
  });
});
