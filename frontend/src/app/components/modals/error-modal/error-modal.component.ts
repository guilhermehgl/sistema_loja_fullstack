import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal">
      <h2>Erro</h2>
      <p>{{ message }}</p>
      <button (click)="close.emit()">OK</button>
    </div>
  `,
  styles: [`
    .modal {
      background:white; padding:20px; border-radius:8px; width:300px;
      text-align:center;
    }
  `]
})
export class ErrorModalComponent {
  @Input() message = '';
  @Output() close = new EventEmitter<void>();
}
