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
    // Se já existir barcode, faz reposição de estoque em vez de duplicar registro.
    const product = await this.repository.findOne({
      where: { barcode: dto.barcode },
    });

    if (product) {
      product.quantity += dto.quantity;

      if (dto.price !== product.price) {
        // Mantém preço sincronizado quando houver mudança no cadastro de entrada.
        product.price = dto.price;
      }

      return this.repository.save(product);
    }

    // Cadastro inicial do produto quando não há barcode prévio.
    const newProduct = this.repository.create(dto);
    return this.repository.save(newProduct);
  }

  async updatePrice(id: string, price: number) {
    // Atualização direta do preço para cenários de reajuste rápido.
    const product = await this.repository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado');
    }

    product.price = price;
    return this.repository.save(product);
  }

  findAll() {
    // Lista simples sem filtros; o frontend faz tratamento de exibição.
    return this.repository.find();
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    // Alterações completas exigem validação administrativa.
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
    // Exclusão protegida para evitar remoção acidental por clientes comuns.
    this.assertAdminPassword(adminPassword);

    return this.repository.delete(id);
  }

  validateAdminPassword(adminPassword: string) {
    // Endpoint dedicado para validar senha e permitir fluxo de confirmação no frontend.
    this.assertAdminPassword(adminPassword);
    return { valid: true as const };
  }

  private assertAdminPassword(adminPassword: string): void {
    // Prioriza hash em produção; senha em texto puro fica como fallback local.
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

      // Comparação constante evita vazamento por ataque de timing.
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
    // Só compara buffers do mesmo tamanho para manter contrato da timingSafeEqual.
    const currentBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    if (currentBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(currentBuffer, expectedBuffer);
  }
}
