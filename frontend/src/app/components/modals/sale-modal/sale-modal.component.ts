import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../../core/services/products.service';
import { HttpClient } from '@angular/common/http';
import { SaleConfirmModalComponent } from './sale-confirm-modal.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-sale-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SaleConfirmModalComponent, ErrorModalComponent],
  templateUrl: './sale-modal.component.html',
  styleUrls: ['./sale-modal.component.scss'],
})
export class SaleModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  products: Product[] = [];
  filtered: Product[] = [];
  search: string = '';
  cart: CartItem[] = [];
  total: number = 0;
  showConfirmModal = false;
  showErrorModal = false;
  errorMessage = '';

  constructor(private productsService: ProductsService, private http: HttpClient) { }

  ngOnInit(): void {
    this.productsService.products$.subscribe((data) => {
      this.products = data;
    });
    this.productsService.load();
  }

  filter() {
    const term = this.search.toLowerCase();
    this.filtered = this.products
      .filter(p => p.name.toLowerCase().includes(term) || p.barcode.includes(term))
      .slice(0, 3); // mostra no máximo 3 produtos
  }

  validateQuantity(item: CartItem) {
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }
  }

  add(product: Product) {
    const existing = this.cart.find(c => c.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.updateTotal();
  }

  updateTotal() {
    this.total = this.cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }


  finish() {
    this.showConfirmModal = false;
    this.showErrorModal = false;
    this.errorMessage = '';

    const items = this.cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    const invalidItems = this.cart.filter(c => c.quantity > c.product.quantity);
    if (invalidItems.length) {
      this.errorMessage = `Estoque insuficiente para ${invalidItems.map(i => i.product.name).join(', ')}`;
      this.showErrorModal = true;
      return;
    }

    this.http.post('http://localhost:3000/orders', { items }).subscribe({
      next: () => {
        this.showConfirmModal = true; // modal de confirmação
        this.productsService.load();
      },
      error: (err) => {
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Erro ao finalizar venda';
        }
        this.showErrorModal = true;
      }

    });
  }

  onCloseError() {
    this.showErrorModal = false; // fecha modal de erro
    // não toca na venda principal, então ela volta automaticamente
  }



  onCloseConfirm() {
    this.showConfirmModal = false;
    this.cart = [];
    this.updateTotal();
    this.close.emit();
  }
}
