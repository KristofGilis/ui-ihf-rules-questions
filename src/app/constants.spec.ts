import { ANIMATION, BREAKPOINTS, QUIZ_CONFIG, TOAST_DURATION, Z_INDEX } from './constants';

describe('Constants', () => {
  describe('Z_INDEX', () => {
    it('should have TOAST with highest z-index', () => {
      expect(Z_INDEX.TOAST).toBe(10000);
    });

    it('should have SKIP_LINK just below TOAST', () => {
      expect(Z_INDEX.SKIP_LINK).toBe(9999);
    });

    it('should have MODAL z-index', () => {
      expect(Z_INDEX.MODAL).toBe(1000);
    });

    it('should have HEADER z-index', () => {
      expect(Z_INDEX.HEADER).toBe(50);
    });

    it('should have FOOTER z-index', () => {
      expect(Z_INDEX.FOOTER).toBe(50);
    });
  });

  describe('TOAST_DURATION', () => {
    it('should have ERROR duration of 5000ms', () => {
      expect(TOAST_DURATION.ERROR).toBe(5000);
    });

    it('should have WARNING duration of 5000ms', () => {
      expect(TOAST_DURATION.WARNING).toBe(5000);
    });

    it('should have SUCCESS duration of 3000ms', () => {
      expect(TOAST_DURATION.SUCCESS).toBe(3000);
    });

    it('should have INFO duration of 3000ms', () => {
      expect(TOAST_DURATION.INFO).toBe(3000);
    });
  });

  describe('QUIZ_CONFIG', () => {
    it('should have TIME_PER_QUESTION of 90 seconds', () => {
      expect(QUIZ_CONFIG.TIME_PER_QUESTION).toBe(90);
    });

    it('should have DEFAULT_QUESTION_COUNT of 10', () => {
      expect(QUIZ_CONFIG.DEFAULT_QUESTION_COUNT).toBe(10);
    });
  });

  describe('ANIMATION', () => {
    it('should have TOAST_SLIDE duration of 300ms', () => {
      expect(ANIMATION.TOAST_SLIDE).toBe(300);
    });

    it('should have DIALOG_FADE duration of 200ms', () => {
      expect(ANIMATION.DIALOG_FADE).toBe(200);
    });

    it('should have SCROLL_DELAY of 100ms', () => {
      expect(ANIMATION.SCROLL_DELAY).toBe(100);
    });
  });

  describe('BREAKPOINTS', () => {
    it('should have SM breakpoint at 640px', () => {
      expect(BREAKPOINTS.SM).toBe(640);
    });

    it('should have MD breakpoint at 768px', () => {
      expect(BREAKPOINTS.MD).toBe(768);
    });

    it('should have LG breakpoint at 1024px', () => {
      expect(BREAKPOINTS.LG).toBe(1024);
    });

    it('should have XL breakpoint at 1280px', () => {
      expect(BREAKPOINTS.XL).toBe(1280);
    });

    it('should have 2XL breakpoint at 1536px', () => {
      expect(BREAKPOINTS['2XL']).toBe(1536);
    });
  });
});
