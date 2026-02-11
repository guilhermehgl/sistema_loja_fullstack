import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ProductsService } from './products.service';
import { environment } from '../../../environments/environment';

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

  private API = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private productsService: ProductsService,
  ) {}

  createOrder(dto: CreateOrderDto) {
    return this.http.post(this.API, dto).pipe(
      tap(() => {
        // Pedido concluido altera estoque; forca recarga dos produtos na UI.
        this.productsService.load();
      })
    );
  }
}
