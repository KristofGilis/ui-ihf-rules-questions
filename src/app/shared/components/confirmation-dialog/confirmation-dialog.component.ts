import { Component, HostListener, OnInit } from '@angular/core';
import { GradientButtonComponent } from '../gradient-button/gradient-button.component';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  imports: [GradientButtonComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  data: ConfirmationDialogData = {
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
  };

  onConfirm?: () => void;
  onCancel?: () => void;

  ngOnInit() {
    // Focus the dialog when it opens for keyboard accessibility
    setTimeout(() => {
      const dialogElement = document.querySelector('.dialog-content') as HTMLElement;
      dialogElement?.focus();
    }, 0);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.handleCancel();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.handleCancel();
    }
  }

  handleConfirm() {
    this.onConfirm?.();
  }

  handleCancel() {
    this.onCancel?.();
  }
}
