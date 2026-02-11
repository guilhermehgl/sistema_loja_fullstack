import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    updatePrice: jest.fn(),
    updateProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    jest.clearAllMocks();
  });

  it('deve delegar exclusao ao service com adminPassword', async () => {
    serviceMock.delete.mockResolvedValue({ affected: 1 });

    const result = await controller.deleteProduct('p1', { adminPassword: '123' });

    expect(serviceMock.delete).toHaveBeenCalledWith('p1', '123');
    expect(result).toEqual({ affected: 1 });
  });
});
