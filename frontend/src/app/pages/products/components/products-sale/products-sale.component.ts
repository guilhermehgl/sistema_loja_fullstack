import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleModalComponent } from '../../../../shared/components/modal/sale-modal/sale-modal.component';
import { AlertModalComponent } from '../../../../shared/components/modal/alert-modal/alert-modal.component';

@Component({
  selector: 'app-products-sale',
  standalone: true,
  imports: [
    AlertModalComponent,
    SaleModalComponent,
    CommonModule,
  ],
  templateUrl: './products-sale.component.html',
})
export class ProductsSaleComponent {
  isOpen = false;
  showSaleModal = false;
  showAlertModal = false;
  saleTotal = 0;

  openSale() {
    this.showSaleModal = true;
  }

  onSaleSuccess(total: number) {
    this.saleTotal = total;
    this.showAlertModal = true;
  }

  closeAlert() {
    this.showAlertModal = false;
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }
}
