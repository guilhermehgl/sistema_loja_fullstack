import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../base-modal/base-modal.component';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  templateUrl: './alert-modal.component.html',
  styleUrls: ['../../../../../../src/styles/modal.global.scss']
})
export class AlertModalComponent {
  @Input() title = '';
  @Input() message = '';

  @Output() close = new EventEmitter<void>();

  handleClose() {
    // Mantem contrato simples de fechamento para o componente pai.
    this.close.emit();
  }
}
