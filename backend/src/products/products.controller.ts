import { Body, Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePriceDto } from "./dto/update-price.dto"


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

  @Patch(':id/price')
updatePrice(
  @Param('id') id: string,
  @Body() dto: UpdatePriceDto,
) {
  return this.service.updatePrice(id, dto.price);
}
}
