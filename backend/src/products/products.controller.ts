import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminPasswordDto } from './dto/admin-password.dto';
import { validateAdminPassword } from './admin-password';
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }
  @Get()
  findAll() {
    return this.service.findAll();
  }
  @Delete(':id')
  handleProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminPasswordDto,
  ) {
    return this.service.delete(id, dto.adminPassword);
  }
  @Patch(':id/price')
  updatePrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.service.updatePrice(id, dto.price, dto.adminPassword);
  }
  @Post('validate-password')
  validatePassword(@Body('password') password: unknown) {
    return { valid: validateAdminPassword(password) };
  }
  @Patch(':id')
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(id, dto);
  }
}
