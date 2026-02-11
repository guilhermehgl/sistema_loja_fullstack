import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  const api = 'http://localhost:3000/products';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);

    httpMock.expectOne(api).flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve enviar adminPassword ao atualizar produto', () => {
    const product = {
      id: 'p1',
      name: 'Produto',
      barcode: '12345678',
      quantity: 2,
      price: 15.5,
    };

    service.updateProduct(product, 'admin123').subscribe();

    // Garante que a senha admin faz parte do contrato de atualizacao.
    const patchReq = httpMock.expectOne(`${api}/p1`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({
      name: product.name,
      barcode: product.barcode,
      quantity: product.quantity,
      price: product.price,
      adminPassword: 'admin123',
    });
    patchReq.flush(product);

    // Apos mutacao, o service deve recarregar a lista local.
    const reloadReq = httpMock.expectOne(api);
    expect(reloadReq.request.method).toBe('GET');
    reloadReq.flush([product]);
  });
});
