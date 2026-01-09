import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../base-modal/base-modal.component';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  templateUrl: './alert-modal.component.html'
})
export class AlertModalComponent {
  @Input() title = '';
  @Input() message = '';

  @Output() close = new EventEmitter<void>();

  handleClose() {
    this.close.emit();
  }
}
