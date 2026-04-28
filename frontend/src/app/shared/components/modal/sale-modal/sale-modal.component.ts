import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ProductsService, Product } from '../../../../core/services/products.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { addItemToCart, cartTotal, CartItem, increaseItem, normalizeCartQuantity, removeOrDecrease } from './sale-cart.util';

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
export class SaleModalComponent implements OnInit, OnDestroy {

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<number>();

  search = '';
  products: Product[] = [];
  visibleProducts: Product[] = [];
  cart: CartItem[] = [];

  loading = false;
  errorMessage = '';
  productsLoading = true;
  productsLoadError = '';
  private subscriptions = new Subscription();

  constructor(
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) { }

  ngOnInit() {
    this.subscriptions.add(this.productsService.loading$.subscribe((loading) => {
      this.productsLoading = loading;
    }));

    this.subscriptions.add(this.productsService.error$.subscribe((error) => {
      this.productsLoadError = error ?? '';
    }));

    this.subscriptions.add(this.productsService.products$.subscribe(products => {
      this.products = products;
      this.filter();
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    this.cart = addItemToCart(this.cart, product);
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
    item.quantity = normalizeCartQuantity(item.quantity, item.stock);
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
    item.quantity = normalizeCartQuantity(item.quantity, item.stock);
  }

  blockInvalidKeys(event: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  }

  /** Aumenta quantidade */
  inc(item: CartItem) {
    const index = this.cart.findIndex((cartItem) => cartItem.productId === item.productId);
    if (index === -1) return;
    this.cart[index] = increaseItem(this.cart[index]);
  }


  /** Diminui quantidade */
  dec(item: CartItem) {
    this.cart = removeOrDecrease(this.cart, item);
  }

  /** Total da venda (somente visual) */
  get total(): number {
    return cartTotal(this.cart);
  }

  /** Finaliza venda chamando o backend */
  finalize() {
    if (this.cart.length === 0) {
      this.errorMessage = 'Carrinho vazio';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const total = this.total;

    const dto = {
      items: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    this.ordersService.createOrder(dto).subscribe({
      next: () => {
        this.cart = [];
        this.success.emit(total);
        this.loading = false;
        this.close.emit();
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      },
    });
  }

  /** Fecha a modal */
  closeModal() {
    this.close.emit();
  }
}
