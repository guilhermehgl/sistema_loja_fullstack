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

  // 🔍 Busca
  searchTerm: string = '';

  // 🔢 Quantidade por página
  pageSize: number = 20;

  // 🔃 Ordenação
  sortBy: 'barcode' | 'name' = 'barcode';

  // 📄 Paginação
  currentPage: number = 1;
  totalPages: number = 1;

  // Modais
  showConfirmModal = false;
  showAlertModal = false;
  showEditModal = false;
  alertMessage = '';

  // Estado unificado de ação
  confirmAction?: ConfirmAction;
  productTarget?: Product;

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

  // 🔑 Abrir modal de confirmação de senha para delete ou edit
  openConfirmModal(product: Product, action: ConfirmAction) {
    this.productTarget = product;
    this.confirmAction = action;
    this.showConfirmModal = true;
  }

  // 📌 Chamado quando confirma a senha na modal
  confirmActionPassword(password: string) {
    if (!password || !this.productTarget || !this.confirmAction) return;

    this.service.validateAdminPassword(password).subscribe({
      next: (valid: boolean) => {
        this.showConfirmModal = false;

        if (!valid) {
          this.alertMessage = 'Senha inválida!';
          this.showAlertModal = true;
          this.cdr.detectChanges();
          return;
        }

        if (this.confirmAction === 'delete') {
          this.executeDelete(password);
        } else if (this.confirmAction === 'edit') {
          this.showEditModal = true;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showConfirmModal = false;
        this.alertMessage = 'Erro ao validar senha!';
        this.showAlertModal = true;
      }
    });
  }

  // 🔴 Executa delete
  private executeDelete(password: string) {
    if (!this.productTarget) return;

    this.service.handleProduct(this.productTarget.id, password).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== this.productTarget!.id);
        this.applyFilters();

        this.alertMessage = 'Produto deletado com sucesso!';
        this.showAlertModal = true;

        this.productTarget = undefined;
        this.confirmAction = undefined;
        this.cdr.detectChanges();
      },
      error: () => {
        this.alertMessage = 'Erro ao deletar produto!';
        this.showAlertModal = true;

        this.productTarget = undefined;
        this.confirmAction = undefined;
      }
    });
  }

  // 🔄 Atualiza produto após edição
  updateProduct(updated: Product) {
    this.service.updateProduct(updated).subscribe({
      next: () => {
        const index = this.products.findIndex(p => p.id === updated.id);
        if (index !== -1) this.products[index] = updated;

        this.applyFilters();
        this.showEditModal = false;

        this.alertMessage = 'Produto atualizado com sucesso!';
        this.showAlertModal = true;

        this.productTarget = undefined;
        this.confirmAction = undefined;
      },
      error: () => {
        this.alertMessage = 'Erro ao atualizar produto!';
        this.showAlertModal = true;
      }
    });
  }

  // 🔃 Filtros e paginação
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
