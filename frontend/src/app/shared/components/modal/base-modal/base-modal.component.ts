import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.component.html',
  styleUrls: ['../../../../../../src/styles/modal.global.scss']
})
export class BaseModalComponent {
  @Input() title = '';
  @Input() showCancel = false;

  @Output() cancel = new EventEmitter<void>();

  onCancel() {
    // Evento padrao para fechar modal sem acao de confirmacao.
    this.cancel.emit();
  }
}
