import { Component } from '@angular/core';
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
export class ConfirmationDialogComponent {
  data: ConfirmationDialogData = {
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
  };

  onConfirm?: () => void;
  onCancel?: () => void;

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
