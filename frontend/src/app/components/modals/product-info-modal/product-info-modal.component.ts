import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-info-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-info-modal.component.html',
  styleUrls: ['./product-info-modal.component.scss']
})
export class ProductInfoModalComponent {
  @Input() product?: Product;
  @Output() close = new EventEmitter<void>();
}
