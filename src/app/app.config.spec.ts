import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { getBaseUrl, languageInterceptor } from './app.config';
import * as languageModule from './language';

// Mock the language module
jest.mock('./language', () => ({
  getLanguage: jest.fn(),
}));

describe('App Config', () => {
  describe('getBaseUrl', () => {
    it('should return the base URL from the base tag', () => {
      // Create a base element
      const baseElement = document.createElement('base');
      baseElement.href = 'http://localhost:4200/';
      document.head.appendChild(baseElement);

      const result = getBaseUrl();

      expect(result).toBe('http://localhost:4200/');

      // Cleanup
      document.head.removeChild(baseElement);
    });

    it('should return the updated base URL if base tag changes', () => {
      const baseElement = document.createElement('base');
      baseElement.href = 'https://example.com/app/';
      document.head.appendChild(baseElement);

      const result = getBaseUrl();

      expect(result).toBe('https://example.com/app/');

      // Cleanup
      document.head.removeChild(baseElement);
    });
  });

  describe('languageInterceptor', () => {
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockNext = jest.fn((req) => of(req));
      jest.clearAllMocks();
    });

    it('should add Accept-Language header to GraphQL requests', () => {
      const mockLanguage = 'nl';
      jest.spyOn(languageModule, 'getLanguage').mockReturnValue(mockLanguage);

      const request = new HttpRequest('POST', 'http://localhost:4000/graphql', {});

      languageInterceptor(request, mockNext);

      expect(languageModule.getLanguage).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            lazyUpdate: expect.arrayContaining([
              expect.objectContaining({
                name: 'Accept-Language',
                value: mockLanguage,
              }),
            ]),
          }),
        })
      );
    });

    it('should add Accept-Language header for graphql endpoint without domain', () => {
      const mockLanguage = 'en';
      jest.spyOn(languageModule, 'getLanguage').mockReturnValue(mockLanguage);

      const request = new HttpRequest('POST', '/graphql', {});

      languageInterceptor(request, mockNext);

      expect(languageModule.getLanguage).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/graphql',
        })
      );
    });

    it('should not modify non-GraphQL requests', () => {
      const request = new HttpRequest('GET', 'http://localhost:4000/api/other', {});

      languageInterceptor(request, mockNext);

      expect(languageModule.getLanguage).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(request);
    });

    it('should not modify requests to URLs containing graphql but not ending with it', () => {
      const request = new HttpRequest('GET', 'http://localhost:4000/graphql/test', {});

      languageInterceptor(request, mockNext);

      expect(languageModule.getLanguage).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(request);
    });

    it('should handle different language codes', () => {
      const languages = ['en', 'nl', 'srb', 'de', 'fr'];

      languages.forEach((lang) => {
        jest.spyOn(languageModule, 'getLanguage').mockReturnValue(lang);
        const request = new HttpRequest('POST', '/graphql', {});

        languageInterceptor(request, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.objectContaining({
              lazyUpdate: expect.arrayContaining([
                expect.objectContaining({
                  name: 'Accept-Language',
                  value: lang,
                }),
              ]),
            }),
          })
        );

        mockNext.mockClear();
      });
    });

    it('should preserve existing headers when adding Accept-Language', () => {
      jest.spyOn(languageModule, 'getLanguage').mockReturnValue('en');

      const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', 'Bearer token123');

      const request = new HttpRequest('POST', '/graphql', {}, { headers });

      languageInterceptor(request, mockNext);

      const interceptedRequest = mockNext.mock.calls[0][0];
      expect(interceptedRequest.headers.get('Content-Type')).toBe('application/json');
      expect(interceptedRequest.headers.get('Authorization')).toBe('Bearer token123');
      expect(interceptedRequest.headers.get('Accept-Language')).toBe('en');
    });

    it('should work with query parameters in GraphQL URL', () => {
      jest.spyOn(languageModule, 'getLanguage').mockReturnValue('nl');

      const request = new HttpRequest('POST', '/graphql?query=test', {});

      languageInterceptor(request, mockNext);

      expect(languageModule.getLanguage).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(request);
    });

    it('should return the result of next handler', (done) => {
      const mockResponse = { data: 'test' };
      mockNext.mockReturnValue(of(mockResponse));

      const request = new HttpRequest('GET', '/api/test', {});

      languageInterceptor(request, mockNext).subscribe((result) => {
        expect(result).toBe(mockResponse);
        done();
      });
    });
  });
});
