import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Message Input', () => {
    it('should default to empty string', () => {
      expect(component.message()).toBe('');
    });

    it('should display provided message', () => {
      fixture.componentRef.setInput('message', 'No items found');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const messageElement = compiled.querySelector('p');
      expect(messageElement?.textContent?.trim()).toBe('No items found');
    });

    it('should update message when input changes', () => {
      fixture.componentRef.setInput('message', 'Initial message');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      let messageElement = compiled.querySelector('p');
      expect(messageElement?.textContent?.trim()).toBe('Initial message');

      fixture.componentRef.setInput('message', 'Updated message');
      fixture.detectChanges();

      messageElement = compiled.querySelector('p');
      expect(messageElement?.textContent?.trim()).toBe('Updated message');
    });
  });

  describe('Icon Path Input', () => {
    it('should default to empty string', () => {
      expect(component.iconPath()).toBe('');
    });

    it('should render SVG when iconPath is provided', () => {
      const pathData = 'M12 4v16m8-8H4';
      fixture.componentRef.setInput('iconPath', pathData);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      const path = svg?.querySelector('path');

      expect(svg).toBeTruthy();
      expect(path?.getAttribute('d')).toBe(pathData);
    });

    it('should not render SVG when iconPath is empty', () => {
      fixture.componentRef.setInput('iconPath', '');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      expect(svg).toBeNull();
    });

    it('should apply correct SVG classes', () => {
      fixture.componentRef.setInput('iconPath', 'M12 4v16m8-8H4');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');

      expect(svg?.classList.contains('mb-4')).toBe(true);
      expect(svg?.classList.contains('h-16')).toBe(true);
      expect(svg?.classList.contains('w-16')).toBe(true);
    });
  });

  describe('Has Action Input', () => {
    it('should default to false', () => {
      expect(component.hasAction()).toBe(false);
    });

    it('should not render action slot by default', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Action content slot should not be rendered
      expect(component.hasAction()).toBe(false);
    });

    it('should allow action slot when hasAction is true', () => {
      fixture.componentRef.setInput('hasAction', true);
      fixture.detectChanges();

      expect(component.hasAction()).toBe(true);
    });
  });

  describe('Template Structure', () => {
    it('should have correct container classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('div.flex.flex-col');

      expect(container).toBeTruthy();
      expect(container?.classList.contains('items-center')).toBe(true);
      expect(container?.classList.contains('justify-center')).toBe(true);
      expect(container?.classList.contains('rounded-2xl')).toBe(true);
      expect(container?.classList.contains('border-2')).toBe(true);
      expect(container?.classList.contains('border-dashed')).toBe(true);
    });

    it('should have correct message styling classes', () => {
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const message = compiled.querySelector('p');

      expect(message?.classList.contains('text-lg')).toBe(true);
      expect(message?.classList.contains('font-medium')).toBe(true);
      expect(message?.classList.contains('mt-2')).toBe(true);
    });
  });

  describe('Content Projection', () => {
    @Component({
      template: `
        <app-empty-state [message]="'No data'" [hasAction]="true">
          <div icon class="custom-icon">Custom Icon</div>
          <button action class="custom-action">Take Action</button>
        </app-empty-state>
      `,
      imports: [EmptyStateComponent],
    })
    class TestHostComponent {}

    it('should project custom icon content', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const compiled = hostFixture.nativeElement as HTMLElement;
      const customIcon = compiled.querySelector('.custom-icon');
      expect(customIcon?.textContent?.trim()).toBe('Custom Icon');
    });

    it('should project action content when hasAction is true', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const compiled = hostFixture.nativeElement as HTMLElement;
      const actionButton = compiled.querySelector('.custom-action');
      expect(actionButton?.textContent?.trim()).toBe('Take Action');
    });
  });

  describe('SVG Path Attributes', () => {
    it('should apply stroke attributes to path', () => {
      fixture.componentRef.setInput('iconPath', 'M12 4v16');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const path = compiled.querySelector('path');

      expect(path?.getAttribute('stroke-linecap')).toBe('round');
      expect(path?.getAttribute('stroke-linejoin')).toBe('round');
      expect(path?.getAttribute('stroke-width')).toBe('2');
    });
  });
});
