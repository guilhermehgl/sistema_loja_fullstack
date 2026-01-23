import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductsService, Product } from '../../../../core/services/products.service';
import { OrdersService } from '../../../../core/services/orders.service';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

@Component({
  selector: 'app-sale-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './sale-modal.component.html',
  styleUrls: ['../../../../../../src/styles/modal.global.scss']
})
export class SaleModalComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<number>();

  search = '';
  products: Product[] = [];
  visibleProducts: Product[] = [];
  cart: CartItem[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) { }

  ngOnInit() {
    this.productsService.products$.subscribe(products => {
      this.products = products;
      this.filter();
    });
  }

  /** Filtra produtos e limita a 3 */
  filter() {
    this.visibleProducts = this.products
      .filter(p =>
        p.name.toLowerCase().includes(this.search.toLowerCase()) ||
        p.barcode.includes(this.search)
      )
      .slice(0, 3);
  }

  /** Adiciona produto ao carrinho */
  add(product: Product) {
    // 🚫 Estoque zerado nunca entra no carrinho
    if (product.quantity <= 0) {
      return;
    }
    const item = this.cart.find(i => i.productId === product.id);

    if (item) {
      if (item.quantity < item.stock) {
        item.quantity++;
      }
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.quantity, // 👈 estoque real
      });
    }
  }

  canAddProduct(product: Product): boolean {
    if (product.quantity <= 0) return false;

    const item = this.cart.find(i => i.productId === product.id);
    return !item || item.quantity < product.quantity;
  }


  canIncrease(item: CartItem): boolean {
    return item.quantity < item.stock;
  }

  onQuantityChange(item: CartItem) {
    // Garante número inteiro
    item.quantity = Math.floor(Number(item.quantity));

    if (item.quantity < 1) {
      item.quantity = 1;
    }

    if (item.quantity > item.stock) {
      item.quantity = item.stock;
    }
  }

  onQuantityInput(event: Event, item: CartItem) {
    const input = event.target as HTMLInputElement;

    // Permite campo vazio enquanto digita
    if (input.value === '') {
      item.quantity = 0;
      return;
    }

    let value = Number(input.value);

    if (isNaN(value)) return;

    // Limita apenas o teto (estoque)
    if (value > item.stock) {
      value = item.stock;
      input.value = String(value);
    }

    item.quantity = value;
  }

  onQuantityBlur(item: CartItem) {
    // Quando sair do campo, garante valor válido
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }
  }

  blockInvalidKeys(event: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  }

  /** Aumenta quantidade */
  inc(item: CartItem) {
    if (item.quantity < item.stock) {
      item.quantity++;
    }
  }


  /** Diminui quantidade */
  dec(item: CartItem) {
    item.quantity--;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i !== item);
    }
  }

  /** Total da venda (somente visual) */
  get total(): number {
    return this.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  /** Finaliza venda chamando o backend */
  finalize() {
    if (this.cart.length === 0) {
      this.errorMessage = 'Carrinho vazio';
      return;
    }

    // Aqui futuramente entra chamada ao backend (/orders)
    const total = this.total;

    this.success.emit(total);
    this.close.emit();

    this.loading = true;
    this.errorMessage = '';

    const dto = {
      items: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    this.ordersService.createOrder(dto).subscribe({
      next: () => {
        this.cart = [];
        this.loading = false;
        this.close.emit();
      },
      error: err => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Erro ao realizar a venda';
      },
    });
  }

  /** Fecha a modal */
  closeModal() {
    this.close.emit();
  }
}
