// toast.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../services/notification/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts; trackBy: trackByToast" 
        class="toast"
        [class]="'toast-' + toast.type"
        [@slideIn]>
        
        <div class="toast-icon">
          <!-- Success Icon -->
          <svg *ngIf="toast.type === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          
          <!-- Error Icon -->
          <svg *ngIf="toast.type === 'error'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          
          <!-- Info Icon -->
          <svg *ngIf="toast.type === 'info'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          
          <!-- Warning Icon -->
          <svg *ngIf="toast.type === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div *ngIf="toast.message" class="toast-message">{{ toast.message }}</div>
        </div>
        
        <button class="toast-close" (click)="removeToast(toast.id)">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }
    
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(10px);
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
      border-left: 4px solid;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .toast-success {
      background: rgba(34, 197, 94, 0.95);
      color: white;
      border-left-color: #16a34a;
    }
    
    .toast-error {
      background: rgba(239, 68, 68, 0.95);
      color: white;
      border-left-color: #dc2626;
    }
    
    .toast-info {
      background: rgba(59, 130, 246, 0.95);
      color: white;
      border-left-color: #2563eb;
    }
    
    .toast-warning {
      background: rgba(245, 158, 11, 0.95);
      color: white;
      border-left-color: #d97706;
    }
    
    .toast-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .toast-content {
      flex: 1;
    }
    
    .toast-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }
    
    .toast-message {
      font-size: 13px;
      opacity: 0.9;
      line-height: 1.4;
    }
    
    .toast-close {
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      flex-shrink: 0;
      padding: 0;
    }
    
    .toast-close:hover {
      opacity: 1;
    }
    
    .toast-close svg {
      width: 100%;
      height: 100%;
    }
    
    @media (max-width: 480px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
      
      .toast {
        min-width: unset;
      }
    }
  `],
  animations: []
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
      
      // Auto remove after duration
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration || 3000);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  trackByToast(index: number, toast: Toast): string {
    return toast.id;
  }
}