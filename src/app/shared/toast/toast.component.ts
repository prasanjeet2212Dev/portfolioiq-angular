import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  close(id: number) {
    this.toastService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }
}
