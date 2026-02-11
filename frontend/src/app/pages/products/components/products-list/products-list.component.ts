import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../../../core/services/products.service';
import { ConfirmModalComponent } from '../../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../../../shared/components/modal/alert-modal/alert-modal.component';
import { EditProductModalComponent } from "../../../../shared/components/modal/edit-modal/edit-modal.component"

type ConfirmAction = 'delete' | 'edit';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, ConfirmModalComponent, AlertModalComponent, EditProductModalComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  processedProducts: Product[] = [];


  searchTerm: string = '';


  pageSize: number = 20;


  sortBy: 'barcode' | 'name' = 'barcode';


  currentPage: number = 1;
  totalPages: number = 1;

  showConfirmModal = false;
  showAlertModal = false;
  showEditModal = false;
  alertMessage = '';

  confirmAction?: ConfirmAction;
  productTarget?: Product;
  adminPassword = '';

  constructor(private service: ProductsService, private cdr: ChangeDetectorRef) {}

  get allBarcodes(): string[] {
  return this.products.map(p => p.barcode?.toString() || '');
}

  ngOnInit() {
    this.service.products$.subscribe((data) => {
      this.products = data;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  openConfirmModal(product: Product, action: ConfirmAction) {
    this.productTarget = product;
    this.confirmAction = action;
    this.showConfirmModal = true;
  }

  confirmActionPassword(password: string) {
    if (!password || !this.productTarget || !this.confirmAction) return;

    this.adminPassword = password;
    this.showConfirmModal = false;

    if (this.confirmAction === 'delete') {
      this.executeDelete(password);
      return;
    }

    if (this.confirmAction === 'edit') {
      this.showEditModal = true;
      this.cdr.detectChanges();
    }
  }

  private executeDelete(password: string) {
    if (!this.productTarget) return;

    this.service.deleteProduct(this.productTarget.id, password).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== this.productTarget!.id);
        this.applyFilters();

        this.alertMessage = 'Produto deletado com sucesso!';
        this.showAlertModal = true;

        this.productTarget = undefined;
        this.confirmAction = undefined;
        this.adminPassword = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.alertMessage = err?.status === 403
          ? 'Senha de administrador invalida!'
          : 'Erro ao deletar produto!';
        this.showAlertModal = true;

        this.productTarget = undefined;
        this.confirmAction = undefined;
        this.adminPassword = '';
      }
    });
  }

  updateProduct(updated: Product) {
    this.service.updateProduct(updated, this.adminPassword).subscribe({
      next: () => {
        const index = this.products.findIndex(p => p.id === updated.id);
        if (index !== -1) this.products[index] = updated;

        this.applyFilters();
        this.showEditModal = false;

        this.alertMessage = 'Produto atualizado com sucesso!';
        this.showAlertModal = true;

        this.productTarget = undefined;
        this.confirmAction = undefined;
        this.adminPassword = '';
      },
      error: (err) => {
        this.alertMessage = err?.status === 403
          ? 'Senha de administrador invalida!'
          : 'Erro ao atualizar produto!';
        this.showAlertModal = true;
      }
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.adminPassword = '';
    this.productTarget = undefined;
    this.confirmAction = undefined;
  }

  applyFilters() {
    const pageSize = Number(this.pageSize);
    let result = [...this.products];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        product => product.name.toLowerCase().includes(term) || product.barcode.toString().includes(term)
      );
    }

    result.sort((a, b) => this.sortBy === 'barcode' ? Number(a.barcode) - Number(b.barcode) : a.name.localeCompare(b.name));

    this.processedProducts = result;

    this.totalPages = Math.max(1, Math.ceil(result.length / pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    this.filteredProducts = this.processedProducts.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }
}
