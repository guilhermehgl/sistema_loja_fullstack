import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto) {
    const product = await this.repository.findOne({
      where: { barcode: dto.barcode },
    });

    // Se já existir, soma a quantidade
    if (product) {
      product.quantity += dto.quantity;

      // Atualiza o preço se vier diferente
      if (dto.price !== product.price) {
        product.price = dto.price;
      }

      return this.repository.save(product);
    }

    // Se não existir, cria novo
    const newProduct = this.repository.create(dto);
    return this.repository.save(newProduct);
  }

  async updatePrice(id: string, price: number) {
    const product = await this.repository.findOneBy({ id });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    product.price = price;
    return this.repository.save(product);
  }

  findAll() {
    return this.repository.find();
  }

  delete(id: string, adminPassword: string) {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (adminPassword !== ADMIN_PASSWORD) {
      throw new ForbiddenException('Senha de administrador inválida');
    }

    return this.repository.delete(id);
  }
}
