import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { GetVersionGQL } from '../../../graphql/generated';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;
  let getVersionGQL: jest.Mocked<GetVersionGQL>;

  beforeEach(async () => {
    const mockQuery = {
      valueChanges: of({
        data: { version: '1.0.0' },
        loading: false,
        networkStatus: 7,
      }),
      refetch: jest.fn().mockReturnValue(
        of({
          data: { version: '1.0.0' },
          loading: false,
          networkStatus: 7,
        })
      ),
    };

    const getVersionGQLMock = {
      watch: jest.fn().mockReturnValue(mockQuery),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: GetVersionGQL, useValue: getVersionGQLMock },
        provideTranslateService(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    getVersionGQL = TestBed.inject(GetVersionGQL) as jest.Mocked<GetVersionGQL>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('FontAwesome Icons', () => {
    it('should have faFileAlt icon defined', () => {
      expect(component.faFileAlt).toBeDefined();
      expect(component.faFileAlt.iconName).toBe('file-lines');
    });

    it('should have faChevronRight icon defined', () => {
      expect(component.faChevronRight).toBeDefined();
      expect(component.faChevronRight.iconName).toBe('chevron-right');
    });

    it('should have faQuestionCircle icon defined', () => {
      expect(component.faQuestionCircle).toBeDefined();
      expect(component.faQuestionCircle.iconName).toBe('circle-question');
    });

    it('should have faGithub icon defined', () => {
      expect(component.faGithub).toBeDefined();
      expect(component.faGithub.iconName).toBe('github');
    });

    it('should have faExternalLinkAlt icon defined', () => {
      expect(component.faExternalLinkAlt).toBeDefined();
      expect(component.faExternalLinkAlt.iconName).toBe('up-right-from-square');
    });

    it('should have faSpinner icon defined', () => {
      expect(component.faSpinner).toBeDefined();
      expect(component.faSpinner.iconName).toBe('spinner');
    });
  });

  describe('onStartQuiz', () => {
    it('should navigate to quiz view with correct state', () => {
      const config = {
        questionCount: 15,
        timedMode: true,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 15,
          timed: true,
        },
      });
    });

    it('should navigate with default config values', () => {
      const config = {
        questionCount: 10,
        timedMode: false,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 10,
          timed: false,
        },
      });
    });

    it('should handle large question count', () => {
      const config = {
        questionCount: 100,
        timedMode: false,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 100,
          timed: false,
        },
      });
    });

    it('should call navigate only once per invocation', () => {
      const config = {
        questionCount: 10,
        timedMode: false,
      };

      component.onStartQuiz(config);
      expect(router.navigate).toHaveBeenCalledTimes(1);

      component.onStartQuiz(config);
      expect(router.navigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Environment Configuration', () => {
    it('should have githubUrl defined', () => {
      expect(component.githubUrl).toBeDefined();
      expect(typeof component.githubUrl).toBe('string');
    });
  });

  describe('Version Observable', () => {
    it('should have version$ observable', () => {
      expect(component.version$).toBeDefined();
    });

    it('should call GetVersionGQL.watch on initialization', () => {
      expect(getVersionGQL.watch).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should have loadingVersion signal', () => {
      expect(component.loadingVersion).toBeDefined();
    });

    it('should initialize loadingVersion as false', () => {
      expect(component.loadingVersion()).toBe(false);
    });
  });

  describe('Component Configuration', () => {
    it('should be standalone component', () => {
      const metadata = (component.constructor as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete quiz setup flow', () => {
      const config = {
        questionCount: 20,
        timedMode: true,
      };

      component.onStartQuiz(config);

      expect(router.navigate).toHaveBeenCalledWith(['/quiz/view'], {
        state: {
          count: 20,
          timed: true,
        },
      });
    });
  });
});
