import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';

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

  /** Carrega todos os produtos e atualiza o BehaviorSubject */
  load() {
    this.http.get<Product[]>(this.API)
      .subscribe(data => this._products$.next(data));
  }

  /** Cria um novo produto */
  create(product: Partial<Product>) {
    return this.http.post<Product>(this.API, product).pipe(
      tap(() => this.load())
    );
  }

  /** Deleta um produto enviando senha de admin */
  handleProduct(productId: string, adminPassword: string) {
    return this.http.delete(`${this.API}/${productId}`, {
      body: { adminPassword }
    }).pipe(
      tap(() => this.load())
    );
  }

  /** Verifica se existe produto com o mesmo barcode */
  existsByBarcode(barcode: string): boolean {
    if (!barcode) return false;
    return this._products$.value.some(p => p.barcode === barcode);
  }

  /** Valida a senha de administrador via backend */
  validateAdminPassword(password: string) {
    return this.http.post<{ valid: boolean }>(`${this.API}/validate-password`, { password })
      .pipe(
        map(res => res.valid)
      );
  }

  updateProduct(product: Product) {
    return this.http.patch<Product>(`${this.API}/${product.id}`, product)
      .pipe(tap(() => this.load()));
  }
}
