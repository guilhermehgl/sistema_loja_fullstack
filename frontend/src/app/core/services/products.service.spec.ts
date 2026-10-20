import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Product, ProductsService } from './products.service';
describe('Contrato da edição administrativa', () => {
  let service: ProductsService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductsService);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.method === 'GET').flush([]);
  });
  afterEach(() => http.verify());
  it('envia confirmação e somente campos alterados, sem reenviar estoque antigo ou id', () => {
    const original: Product = {id:'produto',name:'Produto teste',barcode:'12345678',quantity:5,price:2};
    service.updateProduct({...original,price:3}, 'confirmacao-so-do-teste', original).subscribe();
    const req = http.expectOne(r => r.method === 'PATCH');
    expect(req.request.body).toEqual({price:3,adminPassword:'confirmacao-so-do-teste'});
    req.flush({...original,price:3,quantity:4});
    http.expectOne(r => r.method === 'GET').flush([{...original,price:3,quantity:4}]);
  });
});
