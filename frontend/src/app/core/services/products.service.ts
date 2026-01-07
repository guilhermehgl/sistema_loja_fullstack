import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  quantity: number;
  price: number;
}
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private API = 'http://localhost:3000/products';

  private _products$ = new BehaviorSubject<Product[]>([]);
  products$ = this._products$.asObservable();

  constructor(private http: HttpClient) {
    this.load();
  }

  load() {
    this.http
      .get<Product[]>(this.API)
      .subscribe(data => this._products$.next(data));
  }

  create(product: Partial<Product>) {
    return this.http.post<Product>(this.API, product).pipe(
      tap(() => this.load())
    );
  }

  // ✅ AQUI está a correção
  existsByBarcode(barcode: string): boolean {
    if (!barcode) return false;

    return this._products$.value.some(
      product => product.barcode === barcode
    );
  }
}