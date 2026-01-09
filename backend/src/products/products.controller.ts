import { Body, Controller, Get, Post, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePriceDto } from "./dto/update-price.dto"


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
  handleProduct(
    @Param('id') id: string,
    @Body('adminPassword') adminPassword: string,
  ) {
    return this.service.delete(id, adminPassword);
  }

  @Patch(':id/price')
  updatePrice(
    @Param('id') id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.service.updatePrice(id, dto.price);
  }

  @Post('validate-password')
  validatePassword(@Body('password') password: string) {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    return { valid: password === ADMIN_PASSWORD };
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updatedProduct: Partial<CreateProductDto>
  ) {
    return this.service.updateProduct(id, updatedProduct);
  }

}
