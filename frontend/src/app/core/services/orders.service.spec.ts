import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrdersService } from './orders.service';
import { ProductsService } from './products.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;
  const productsServiceMock = {
    load: vi.fn(),
  };

  beforeEach(() => {
    productsServiceMock.load.mockReset();

    TestBed.configureTestingModule({
      providers: [
        OrdersService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ProductsService,
          useValue: productsServiceMock,
        },
      ],
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve criar pedido e recarregar produtos', () => {
    const dto = {
      items: [{ productId: 'p1', quantity: 2 }],
    };

    service.createOrder(dto).subscribe();

    // Confirma contrato HTTP do endpoint de pedidos.
    const req = httpMock.expectOne('http://localhost:3000/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ id: 'o1' });

    // Venda concluida precisa atualizar estoque visivel no frontend.
    expect(productsServiceMock.load).toHaveBeenCalledTimes(1);
  });
});
