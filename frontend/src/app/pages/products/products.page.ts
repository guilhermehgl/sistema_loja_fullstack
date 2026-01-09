import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsFormComponent } from './components/products-form/products-form.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { BarcodeReaderComponent } from '../../shared/components/barcode-reader/barcode-reader.component';
import { Product, ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductsFormComponent,
    ProductsListComponent,
    BarcodeReaderComponent,
  ],
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss']
})
export class ProductsPage {
  showSaleModal = false;
  showBarcodeReader = false;
  showProductInfoModal = false;
  scannedProduct?: Product;

  constructor(private productsService: ProductsService) {}

  openBarcodeReader() { this.showBarcodeReader = true; }
  closeBarcodeReader() { this.showBarcodeReader = false; }

  onBarcodeScanned(barcode: string) {

this.productsService.products$.subscribe(products => {
  const product = products.find((p: Product) => p.barcode === barcode);
  if (product) {
    this.scannedProduct = product;
    this.showProductInfoModal = true;
  } else {
    alert('Produto não encontrado');
  }
  this.showBarcodeReader = false;
});

  }

  closeProductInfoModal() {
    this.showProductInfoModal = false;
    this.scannedProduct = undefined;
  }
}
