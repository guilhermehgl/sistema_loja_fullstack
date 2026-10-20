import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { requireAdminPassword } from './admin-password';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repository: Repository<Product>,
  ) {}
  async create(dto: CreateProductDto) {
    // O índice único arbitra cadastros simultâneos; reposição soma no banco.
    const [product] = await this.repository.query<Product[]>(
      `INSERT INTO products (name, barcode, quantity, price) VALUES ($1, $2, $3, $4)
       ON CONFLICT (barcode) DO UPDATE
       SET quantity = products.quantity + EXCLUDED.quantity, price = EXCLUDED.price
       RETURNING *`,
      [dto.name, dto.barcode, dto.quantity, dto.price],
    );
    return product;
  }
  updatePrice(id: string, price: number, password: unknown) {
    return this.updateProduct(id, { price, adminPassword: password as string });
  }
  findAll() {
    return this.repository.find();
  }
  async updateProduct(id: string, dto: UpdateProductDto) {
    requireAdminPassword(dto.adminPassword);
    const { name, barcode, quantity, price } = dto;
    const changes = Object.fromEntries(
      Object.entries({ name, barcode, quantity, price }).filter(
        ([, value]) => value !== undefined,
      ),
    );
    if (!Object.keys(changes).length) {
      const product = await this.repository.findOneBy({ id });
      if (!product) throw new NotFoundException('Produto não encontrado.');
      return product;
    }
    try {
      // Alterar preço/nome não salva um saldo de estoque lido anteriormente.
      const result = await this.repository
        .createQueryBuilder()
        .update(Product)
        .set(changes)
        .where('id = :id', { id })
        .returning('*')
        .execute();
      if (!result.affected)
        throw new NotFoundException('Produto não encontrado.');
      return (result.raw as Product[])[0];
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      )
        throw new ConflictException('Código de barras já cadastrado.');
      throw error;
    }
  }
  delete(id: string, password: unknown) {
    requireAdminPassword(password);
    return this.repository.delete(id);
  }
}
