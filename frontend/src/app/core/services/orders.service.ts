import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { ProductsService } from './products.service';
import { environment } from '../../../environments/environment';
import { getApiErrorMessage } from '../utils/api-error.util';

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
    private productsService: ProductsService, // 👈 para atualizar estoque
  ) {}

  /** Cria uma venda */
  createOrder(dto: CreateOrderDto) {
    return this.http.post(this.API, dto).pipe(
      catchError((error) => throwError(() => new Error(getApiErrorMessage(error, 'Erro ao realizar venda.')))),
      tap(() => {
        this.productsService.load();
      })
    );
  }
}
