import { Body, Controller, Get, Post, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePriceDto } from "./dto/update-price.dto"
import { AdminPasswordDto } from './dto/admin-password.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Controller HTTP de produtos: expõe operações de leitura, criação e administração.
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) { }

  @Post()
  // Cria novo produto ou incrementa estoque quando o barcode já existe.
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  // Retorna a listagem completa de produtos cadastrados.
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  // Exige senha administrativa para excluir produto.
  deleteProduct(
    @Param('id') id: string,
    @Body() dto: AdminPasswordDto,
  ) {
    return this.service.delete(id, dto.adminPassword);
  }

  @Post('admin/verify')
  // Endpoint utilitário para validar credenciais administrativas.
  verifyAdmin(@Body() dto: AdminPasswordDto) {
    return this.service.validateAdminPassword(dto.adminPassword);
  }

  @Patch(':id/price')
  // Atualiza apenas o preço de um produto.
  updatePrice(
    @Param('id') id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.service.updatePrice(id, dto.price);
  }

  @Patch(':id')
  // Atualização parcial protegida por senha administrativa.
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(id, dto);
  }

}
