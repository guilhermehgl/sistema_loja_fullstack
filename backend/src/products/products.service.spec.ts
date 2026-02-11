import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  // Mock de repositório para isolar regras do service em testes unitários.
  const repositoryMock = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    process.env.ADMIN_PASSWORD = 'admin123';
    delete process.env.ADMIN_PASSWORD_HASH;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('deve criar produto quando barcode nao existe', async () => {
    const dto = { name: 'Mouse Gamer', barcode: '12345678', quantity: 5, price: 49.9 };
    const created = { id: 'p1', ...dto };

    repositoryMock.findOne.mockResolvedValue(null);
    repositoryMock.create.mockReturnValue(created);
    repositoryMock.save.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(repositoryMock.findOne).toHaveBeenCalledWith({
      where: { barcode: dto.barcode },
    });
    expect(repositoryMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('deve rejeitar exclusao com senha invalida', () => {
    expect(() => service.delete('p1', 'senha-errada')).toThrow(ForbiddenException);
    expect(repositoryMock.delete).not.toHaveBeenCalled();
  });
});
