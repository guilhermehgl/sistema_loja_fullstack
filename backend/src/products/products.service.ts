import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
      throw new NotFoundException('Produto nao encontrado');
    }

    product.price = price;
    return this.repository.save(product);
  }

  findAll() {
    return this.repository.find();
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    this.assertAdminPassword(dto.adminPassword);

    const product = await this.repository.findOneBy({ id });
    if (!product) throw new NotFoundException('Produto nao encontrado');

    product.name = dto.name ?? product.name;
    product.barcode = dto.barcode ?? product.barcode;
    product.quantity = dto.quantity ?? product.quantity;
    product.price = dto.price ?? product.price;

    return this.repository.save(product);
  }

  delete(id: string, adminPassword: string) {
    this.assertAdminPassword(adminPassword);

    return this.repository.delete(id);
  }

  validateAdminPassword(adminPassword: string) {
    this.assertAdminPassword(adminPassword);
    return { valid: true as const };
  }

  private assertAdminPassword(adminPassword: string): void {
    const configuredHash = process.env.ADMIN_PASSWORD_HASH?.trim().toLowerCase();
    const configuredPlain = process.env.ADMIN_PASSWORD;

    if (!adminPassword?.trim()) {
      throw new ForbiddenException('Credenciais administrativas invalidas');
    }

    if (configuredHash) {
      const currentHash = createHash('sha256')
        .update(adminPassword)
        .digest('hex')
        .toLowerCase();

      if (!this.constantTimeEqual(currentHash, configuredHash)) {
        throw new ForbiddenException('Credenciais administrativas invalidas');
      }

      return;
    }

    if (configuredPlain && this.constantTimeEqual(adminPassword, configuredPlain)) {
      return;
    }

    throw new ForbiddenException('Credenciais administrativas invalidas');
  }

  private constantTimeEqual(value: string, expected: string): boolean {
    const currentBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    if (currentBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(currentBuffer, expectedBuffer);
  }
}
