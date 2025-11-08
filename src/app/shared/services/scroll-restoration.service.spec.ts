import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ScrollRestorationService } from './scroll-restoration.service';

describe('ScrollRestorationService', () => {
  let service: ScrollRestorationService;
  let router: any; // Using 'any' to allow url assignment in tests
  let viewportScroller: jest.Mocked<ViewportScroller>;
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    routerEventsSubject = new Subject();

    const routerMock = {
      url: '/initial',
      events: routerEventsSubject.asObservable(),
    };

    const viewportScrollerMock = {
      getScrollPosition: jest.fn().mockReturnValue([0, 100]),
      scrollToPosition: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ScrollRestorationService,
        { provide: Router, useValue: routerMock },
        { provide: ViewportScroller, useValue: viewportScrollerMock },
      ],
    });

    service = TestBed.inject(ScrollRestorationService);
    router = TestBed.inject(Router);
    viewportScroller = TestBed.inject(ViewportScroller) as jest.Mocked<ViewportScroller>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Scroll Position Saving', () => {
    it('should save scroll position on NavigationStart', () => {
      router.url = '/page1';
      viewportScroller.getScrollPosition.mockReturnValue([0, 250]);

      routerEventsSubject.next(new NavigationStart(1, '/page2'));

      expect(viewportScroller.getScrollPosition).toHaveBeenCalled();
    });

    it('should save different scroll positions for different URLs', (done) => {
      // Navigate to page1 and scroll
      router.url = '/page1';
      viewportScroller.getScrollPosition.mockReturnValue([0, 100]);
      routerEventsSubject.next(new NavigationStart(1, '/page2'));

      // Navigate to page2 and scroll
      router.url = '/page2';
      viewportScroller.getScrollPosition.mockReturnValue([0, 300]);
      routerEventsSubject.next(new NavigationStart(2, '/page3'));

      // Return to page1 - should restore position 100
      routerEventsSubject.next(new NavigationEnd(3, '/page1', '/page1'));

      // Wait for async scroll restoration
      setTimeout(() => {
        expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 100]);
        done();
      }, 50);
    });
  });

  describe('Scroll Position Restoration', () => {
    it('should restore scroll position on NavigationEnd if position was saved', (done) => {
      // Save position for /page1
      router.url = '/page1';
      viewportScroller.getScrollPosition.mockReturnValue([0, 500]);
      routerEventsSubject.next(new NavigationStart(1, '/page2'));

      // Navigate back to /page1
      routerEventsSubject.next(new NavigationEnd(2, '/page1', '/page1'));

      // Wait for async scroll restoration
      setTimeout(() => {
        expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 500]);
        done();
      }, 50);
    });

    it('should scroll to top if no saved position exists', (done) => {
      routerEventsSubject.next(new NavigationEnd(1, '/new-page', '/new-page'));

      setTimeout(() => {
        expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
        done();
      }, 50);
    });

    it('should use urlAfterRedirects when available', (done) => {
      // Save position for /page1
      router.url = '/page1';
      viewportScroller.getScrollPosition.mockReturnValue([0, 200]);
      routerEventsSubject.next(new NavigationStart(1, '/page2'));

      // Navigate with redirect
      const navEnd = new NavigationEnd(2, '/old-url', '/page1');
      routerEventsSubject.next(navEnd);

      setTimeout(() => {
        expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 200]);
        done();
      }, 50);
    });
  });

  describe('Event Filtering', () => {
    it('should only respond to NavigationStart and NavigationEnd events', () => {
      // Emit other event types
      routerEventsSubject.next({ type: 'SomeOtherEvent' });
      routerEventsSubject.next({ type: 'AnotherEvent' });

      expect(viewportScroller.getScrollPosition).not.toHaveBeenCalled();
      expect(viewportScroller.scrollToPosition).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Navigations', () => {
    it('should maintain separate scroll positions for multiple pages', (done) => {
      // Page 1 -> scroll to 100
      router.url = '/page1';
      viewportScroller.getScrollPosition.mockReturnValue([0, 100]);
      routerEventsSubject.next(new NavigationStart(1, '/page2'));

      // Page 2 -> scroll to 200
      router.url = '/page2';
      viewportScroller.getScrollPosition.mockReturnValue([0, 200]);
      routerEventsSubject.next(new NavigationStart(2, '/page3'));

      // Page 3 -> scroll to 300
      router.url = '/page3';
      viewportScroller.getScrollPosition.mockReturnValue([0, 300]);
      routerEventsSubject.next(new NavigationStart(3, '/page1'));

      // Navigate back to page2
      routerEventsSubject.next(new NavigationEnd(4, '/page2', '/page2'));

      setTimeout(() => {
        expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 200]);

        // Navigate to page3
        routerEventsSubject.next(new NavigationEnd(5, '/page3', '/page3'));

        setTimeout(() => {
          expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 300]);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Horizontal Scrolling', () => {
    it('should save and restore both horizontal and vertical scroll positions', (done) => {
      router.url = '/wide-page';
      viewportScroller.getScrollPosition.mockReturnValue([150, 250]);
      routerEventsSubject.next(new NavigationStart(1, '/other'));

      router.url = '/other';
      routerEventsSubject.next(new NavigationStart(2, '/wide-page'));

      routerEventsSubject.next(new NavigationEnd(3, '/wide-page', '/wide-page'));

      setTimeout(() => {
        expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([150, 250]);
        done();
      }, 50);
    });
  });
});
