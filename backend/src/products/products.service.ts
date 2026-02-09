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
  ) { }

  async create(dto: CreateProductDto) {
    const product = await this.repository.findOne({
      where: { barcode: dto.barcode },
    });

    if (product) {
      product.quantity += dto.quantity;

      if (dto.price !== product.price) {
        product.price = dto.price;
      }

      return this.repository.save(product);
    }

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

  async updateProduct(id: string, dto: Partial<CreateProductDto>) {
    const product = await this.repository.findOneBy({ id });
    if (!product) throw new Error('Produto não encontrado');

    product.name = dto.name ?? product.name;
    product.barcode = dto.barcode ?? product.barcode;
    product.quantity = dto.quantity ?? product.quantity;
    product.price = dto.price ?? product.price;

    return this.repository.save(product);
  }

  delete(id: string, adminPassword: string) {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (adminPassword !== ADMIN_PASSWORD) {
      throw new ForbiddenException('Senha de administrador inválida');
    }

    return this.repository.delete(id);
  }

}
