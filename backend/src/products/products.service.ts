import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

async create(dto: CreateProductDto) {
  const product = await this.repo.findOne({
    where: { barcode: dto.barcode },
  });

  // Se já existir, soma a quantidade
  if (product) {
    product.quantity += dto.quantity;

    // Atualiza o preço se vier diferente
    if (dto.price !== product.price) {
      product.price = dto.price;
    }

    return this.repo.save(product);
  }

  // Se não existir, cria novo
  const newProduct = this.repo.create(dto);
  return this.repo.save(newProduct);
}

async updatePrice(id: string, price: number) {
  const product = await this.repo.findOneBy({ id });

  if (!product) {
    throw new Error('Estoque insuficiente');
  }

  product.price = price;
  return this.repo.save(product);
}

  findAll() {
    return this.repo.find();
  }
}
