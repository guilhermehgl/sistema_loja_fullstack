import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent } from '../base-modal/base-modal.component';
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
    BaseModalComponent,
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
    // Reage a atualizacoes de estoque para manter a busca e selecao consistentes.
    this.productsService.products$.subscribe(products => {
      this.products = products;
      this.filter();
    });
  }

  filter() {
    // Limita resultados para manter modal objetivo durante a busca.
    this.visibleProducts = this.products
      .filter(p =>
        p.name.toLowerCase().includes(this.search.toLowerCase()) ||
        p.barcode.includes(this.search)
      )
      .slice(0, 3);
  }

  add(product: Product) {
    if (product.quantity <= 0) {
      return;
    }
    const item = this.cart.find(i => i.productId === product.id);

    if (item) {
      if (item.quantity < item.stock) {
        item.quantity++;
      }
    } else {
      // Armazena estoque inicial no carrinho para impedir venda acima do limite.
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.quantity, 
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
    // Normaliza para inteiro e respeita limites [1..stock].
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

    if (input.value === '') {
      item.quantity = 0;
      return;
    }

    let value = Number(input.value);

    if (isNaN(value)) return;

    if (value > item.stock) {
      value = item.stock;
      input.value = String(value);
    }

    item.quantity = value;
  }

  onQuantityBlur(item: CartItem) {
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }
  }

  blockInvalidKeys(event: KeyboardEvent) {
    // Input numerico nao deve aceitar notacao cientifica nem sinais.
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  }

  inc(item: CartItem) {
    if (item.quantity < item.stock) {
      item.quantity++;
    }
  }


  dec(item: CartItem) {
    item.quantity--;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i !== item);
    }
  }

  get total(): number {
    return this.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  finalize() {
    if (this.cart.length === 0) {
      this.errorMessage = 'Carrinho vazio';
      return;
    }

    const total = this.total;

    this.loading = true;
    this.errorMessage = '';

    // DTO enviado ao backend inclui apenas dados necessarios para baixa de estoque.
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
        this.success.emit(total);
        this.close.emit();
      },
      error: err => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Erro ao realizar a venda';
      },
    });
  }

  closeModal() {
    this.close.emit();
  }
}
