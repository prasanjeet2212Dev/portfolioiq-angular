import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private idCounter = 0;

  getToasts() {
    return this.toasts$.asObservable();
  }

  success(message: string, duration = 4000) {
    if (!message || !message.trim()) {
      console.warn('Toast: Attempted to show empty success message');
      return;
    }
    this.show({ type: 'success', message: message.trim(), duration });
  }

  error(message: string, duration = 5000) {
    if (!message || !message.trim()) {
      console.warn('Toast: Attempted to show empty error message');
      message = 'An error occurred';
    }
    this.show({ type: 'error', message: message.trim(), duration });
  }

  warning(message: string, duration = 4000) {
    if (!message || !message.trim()) {
      console.warn('Toast: Attempted to show empty warning message');
      return;
    }
    this.show({ type: 'warning', message: message.trim(), duration });
  }

  info(message: string, duration = 4000) {
    if (!message || !message.trim()) {
      console.warn('Toast: Attempted to show empty info message');
      return;
    }
    this.show({ type: 'info', message: message.trim(), duration });
  }

  private show(toast: Omit<Toast, 'id'>) {
    const id = ++this.idCounter;
    const newToast: Toast = { ...toast, id };
    
    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, newToast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.remove(id), toast.duration);
    }
  }

  remove(id: number) {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  confirm(message: string, onConfirm: () => void, onCancel?: () => void) {
    const id = ++this.idCounter;
    const confirmToast: Toast = {
      id,
      type: 'warning',
      message,
      duration: 0 // Don't auto-dismiss
    };
    
    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, confirmToast]);

    // Return methods to handle confirmation
    return {
      confirm: () => {
        this.remove(id);
        onConfirm();
      },
      cancel: () => {
        this.remove(id);
        if (onCancel) onCancel();
      }
    };
  }
}
