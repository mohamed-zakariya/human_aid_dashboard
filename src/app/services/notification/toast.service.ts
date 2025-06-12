// toast.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toasts$ = this.toastSubject.asObservable();

  showSuccess(title: string, message?: string, duration: number = 3000) {
    this.show('success', title, message, duration);
  }

  showError(title: string, message?: string, duration: number = 4000) {
    this.show('error', title, message, duration);
  }

  showInfo(title: string, message?: string, duration: number = 3000) {
    this.show('info', title, message, duration);
  }

  showWarning(title: string, message?: string, duration: number = 3000) {
    this.show('warning', title, message, duration);
  }

  private show(type: Toast['type'], title: string, message?: string, duration: number = 3000) {
    const toast: Toast = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      duration
    };
    
    this.toastSubject.next(toast);
  }
}