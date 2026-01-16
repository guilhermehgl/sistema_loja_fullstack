import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProductsService } from './products.service';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItem[];
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {

  private API = 'http://localhost:3000/orders';

  constructor(
    private http: HttpClient,
    private productsService: ProductsService, // 👈 para atualizar estoque
  ) {}

  /** Cria uma venda */
  createOrder(dto: CreateOrderDto) {
    return this.http.post(this.API, dto).pipe(
      tap(() => {
        // 🔥 após vender, recarrega produtos (estoque atualizado)
        this.productsService.load();
      })
    );
  }
}
