import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../base-modal/base-modal.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['../../../../../../src/styles/modal.global.scss']
})
export class ConfirmModalComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() inputType: 'text' | 'password' | 'email' = 'text';

  value = '';
  error = false;

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

handleConfirm() {
  if (!this.value.trim()) {
    this.error = true;
    return;
  }

  this.confirm.emit(this.value.trim());
}
}
