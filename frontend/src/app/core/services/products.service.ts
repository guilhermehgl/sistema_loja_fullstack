import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private API = `${environment.apiUrl}/products`;

  private _products$ = new BehaviorSubject<Product[]>([]);
  products$ = this._products$.asObservable();

  constructor(private http: HttpClient) {
    this.load();
  }


  load() {
    this.http.get<Product[]>(this.API)
      .subscribe(data => this._products$.next(data));
  }


  create(product: Partial<Product>) {
    return this.http.post<Product>(this.API, product).pipe(
      tap(() => this.load())
    );
  }


  deleteProduct(productId: string, adminPassword: string) {
    return this.http.delete(`${this.API}/${productId}`, {
      body: { adminPassword }
    }).pipe(
      tap(() => this.load())
    );
  }


  existsByBarcode(barcode: string): boolean {
    if (!barcode) return false;
    return this._products$.value.some(p => p.barcode === barcode);
  }


  updateProduct(product: Product, adminPassword: string) {
    const { id, name, barcode, quantity, price } = product;

    return this.http.patch<Product>(`${this.API}/${product.id}`, {
      name,
      barcode,
      quantity,
      price,
      adminPassword,
    }).pipe(
      tap(() => this.load())
    );
  }

  verifyAdminPassword(adminPassword: string) {
    return this.http.post<{ valid: true }>(`${this.API}/admin/verify`, {
      adminPassword,
    });
  }
}
