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

  // Cache local reativo para compartilhar estado de produtos entre componentes.
  private _products$ = new BehaviorSubject<Product[]>([]);
  products$ = this._products$.asObservable();

  constructor(private http: HttpClient) {
    this.load();
  }


  load() {
    // Fonte unica de verdade no frontend: sempre recarrega da API.
    this.http.get<Product[]>(this.API)
      .subscribe(data => this._products$.next(data));
  }


  create(product: Partial<Product>) {
    return this.http.post<Product>(this.API, product).pipe(
      // Revalida lista local apos mutacao para evitar estado stale.
      tap(() => this.load())
    );
  }


  deleteProduct(productId: string, adminPassword: string) {
    return this.http.delete(`${this.API}/${productId}`, {
      body: { adminPassword }
    }).pipe(
      // Sincroniza listagem apos exclusao.
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
      // Mantem comportamento padrao de refresh apos atualizacao.
      tap(() => this.load())
    );
  }

  verifyAdminPassword(adminPassword: string) {
    // Endpoint dedicado para validar senha antes de abrir fluxo de edicao.
    return this.http.post<{ valid: true }>(`${this.API}/admin/verify`, {
      adminPassword,
    });
  }
}
