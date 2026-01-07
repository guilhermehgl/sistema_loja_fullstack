import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsFormComponent } from './products-form.component';
import { ProductsListComponent } from './products-list.component';
import { SaleModalComponent } from '../../components/modals/sale-modal/sale-modal.component';
import { BarcodeReaderComponent } from '../../components/barcode-reader/barcode-reader.component';
import { ProductInfoModalComponent } from '../../components/modals/product-info-modal/product-info-modal.component';
import { Product, ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductsFormComponent,
    ProductsListComponent,
    SaleModalComponent,
    BarcodeReaderComponent,
    ProductInfoModalComponent,
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

  openSale() { this.showSaleModal = true; }
  closeSale() { this.showSaleModal = false; }

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
