import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsFormComponent } from './components/products-form/products-form.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { Product, ProductsService } from '../../core/services/products.service';
import { ProductsSaleComponent } from '../products/components/products-sale/products-sale.component'

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductsFormComponent,
    ProductsListComponent,
    ProductsSaleComponent,
  ],
  templateUrl: './products.page.html',
})
export class ProductsPage {
  showSaleModal = false;
  showProductInfoModal = false;
  scannedProduct?: Product;

  // Container da pagina: injeta estado global de produtos para os componentes filhos.
  constructor(private productsService: ProductsService) {}

}
