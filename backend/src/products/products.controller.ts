import { Body, Controller, Get, Post, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePriceDto } from "./dto/update-price.dto"
import { AdminPasswordDto } from './dto/admin-password.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) { }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  deleteProduct(
    @Param('id') id: string,
    @Body() dto: AdminPasswordDto,
  ) {
    return this.service.delete(id, dto.adminPassword);
  }

  @Post('admin/verify')
  verifyAdmin(@Body() dto: AdminPasswordDto) {
    return this.service.validateAdminPassword(dto.adminPassword);
  }

  @Patch(':id/price')
  updatePrice(
    @Param('id') id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.service.updatePrice(id, dto.price);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.updateProduct(id, dto);
  }

}
