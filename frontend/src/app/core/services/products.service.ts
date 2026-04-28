import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, finalize, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { getApiErrorMessage } from '../utils/api-error.util';

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
  private _loading$ = new BehaviorSubject<boolean>(false);
  loading$ = this._loading$.asObservable();
  private _error$ = new BehaviorSubject<string | null>(null);
  error$ = this._error$.asObservable();
  private _loadedOnce$ = new BehaviorSubject<boolean>(false);
  loadedOnce$ = this._loadedOnce$.asObservable();

  constructor(private http: HttpClient) {
    this.load();
  }

  /** Carrega todos os produtos e atualiza o BehaviorSubject */
  load() {
    this._loading$.next(true);
    this._error$.next(null);

    this.http.get<Product[]>(this.API).pipe(
      tap((data) => {
        this._products$.next(data);
        this._loadedOnce$.next(true);
      }),
      catchError((error) => {
        this._error$.next(getApiErrorMessage(error, 'Erro ao carregar produtos.'));
        return EMPTY;
      }),
      finalize(() => this._loading$.next(false)),
    ).subscribe();
  }

  /** Cria um novo produto */
  create(product: Partial<Product>) {
    return this.http.post<Product>(this.API, product).pipe(
      tap(() => this._error$.next(null)),
      catchError((error) => throwError(() => new Error(getApiErrorMessage(error, 'Erro ao salvar produto.')))),
      tap(() => this.load())
    );
  }

  /** Deleta um produto enviando senha de admin */
  handleProduct(productId: string, adminPassword: string) {
    return this.http.delete(`${this.API}/${productId}`, {
      body: { adminPassword }
    }).pipe(
      catchError((error) => throwError(() => new Error(getApiErrorMessage(error, 'Erro ao deletar produto.')))),
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
        catchError((error) => throwError(() => new Error(getApiErrorMessage(error, 'Erro ao validar senha.')))),
        map(res => res.valid)
      );
  }

  updateProduct(product: Product) {
    return this.http.patch<Product>(`${this.API}/${product.id}`, product)
      .pipe(
        catchError((error) => throwError(() => new Error(getApiErrorMessage(error, 'Erro ao atualizar produto.')))),
        tap(() => this.load()),
      );
  }
}
