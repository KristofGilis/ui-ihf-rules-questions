import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly _appRef = inject(ApplicationRef);
  private readonly _injector = inject(EnvironmentInjector);
  private _dialogRef: ComponentRef<ConfirmationDialogComponent> | null = null;

  confirm(data: ConfirmationDialogData): Observable<boolean> {
    const subject = new Subject<boolean>();

    if (this._dialogRef) {
      this.close();
    }

    // Create the component
    this._dialogRef = createComponent(ConfirmationDialogComponent, {
      environmentInjector: this._injector,
    });

    // Set the data
    this._dialogRef.instance.data = data;

    // Set the callbacks
    this._dialogRef.instance.onConfirm = () => {
      subject.next(true);
      subject.complete();
      this.close();
    };

    this._dialogRef.instance.onCancel = () => {
      subject.next(false);
      subject.complete();
      this.close();
    };

    // Attach to the app
    this._appRef.attachView(this._dialogRef.hostView);
    const domElem = this._dialogRef.location.nativeElement as HTMLElement;
    document.body.appendChild(domElem);

    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden';

    return subject.asObservable();
  }

  private close() {
    if (this._dialogRef) {
      this._appRef.detachView(this._dialogRef.hostView);
      this._dialogRef.destroy();
      this._dialogRef = null;

      // Restore body scroll
      document.body.style.overflow = '';
    }
  }
}
