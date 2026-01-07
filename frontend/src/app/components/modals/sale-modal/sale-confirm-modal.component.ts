import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sale-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay">
      <div class="modal">
        <h2>Venda finalizada</h2>

        <p>Total da compra:</p>
        <h3>R$ {{ total | number:'1.2-2' }}</h3>

        <button (click)="close.emit()">OK</button>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed; top:0; left:0; right:0; bottom:0;
      background: rgba(0,0,0,0.5);
      display:flex; align-items:center; justify-content:center;
    }
    .modal {
      background:white; padding:20px; border-radius:8px; width:300px; text-align:center;
    }
    button { margin-top: 10px; padding: 5px 10px; }
  `]
})
export class SaleConfirmModalComponent {
  @Input() total = 0;
  @Output() close = new EventEmitter<void>();
}
