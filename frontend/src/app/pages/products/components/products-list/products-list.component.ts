import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../../../core/services/products.service';
import { ConfirmModalComponent } from '../../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../../../../shared/components/modal/alert-modal/alert-modal.component';
import { EditProductModalComponent } from "../../../../shared/components/modal/edit-modal/edit-modal.component"
import { Subscription } from 'rxjs';
import { buildProductListState, ProductSortBy } from './products-list-state.util';

type ConfirmAction = 'delete' | 'edit';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, ConfirmModalComponent, AlertModalComponent, EditProductModalComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  processedProducts: Product[] = [];

  // 🔍 Busca
  searchTerm: string = '';

  // 🔢 Quantidade por página
  pageSize: number = 20;

  // 🔃 Ordenação
  sortBy: ProductSortBy = 'barcode';

  // 📄 Paginação
  currentPage: number = 1;
  totalPages: number = 1;

  // Modais
  showConfirmModal = false;
  showAlertModal = false;
  showEditModal = false;
  alertMessage = '';
  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';
  isLoading = true;
  loadError = '';
  loadedOnce = false;

  private subscriptions = new Subscription();

  // Estado unificado de ação
  confirmAction?: ConfirmAction;
  productTarget?: Product;

  constructor(private service: ProductsService, private cdr: ChangeDetectorRef) {}

  get allBarcodes(): string[] {
    return this.products.map(p => p.barcode?.toString() || '');
  }

  get isEmptyState(): boolean {
    return this.loadedOnce && !this.isLoading && !this.loadError && this.processedProducts.length === 0;
  }

  ngOnInit() {
    this.subscriptions.add(this.service.products$.subscribe((data) => {
      this.products = data;
      this.applyFilters();
      this.cdr.markForCheck();
    }));

    this.subscriptions.add(this.service.loading$.subscribe((loading) => {
      this.isLoading = loading;
      this.cdr.markForCheck();
    }));

    this.subscriptions.add(this.service.error$.subscribe((error) => {
      this.loadError = error ?? '';
      this.cdr.markForCheck();
    }));

    this.subscriptions.add(this.service.loadedOnce$.subscribe((loaded) => {
      this.loadedOnce = loaded;
      this.cdr.markForCheck();
    }));
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
        this.alertMessage = 'Não foi possível validar a senha no momento.';
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

        this.setFeedback('Produto removido com sucesso.', 'success');

        this.productTarget = undefined;
        this.confirmAction = undefined;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.setFeedback(error.message, 'error');

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

        this.setFeedback('Produto atualizado com sucesso.', 'success');

        this.productTarget = undefined;
        this.confirmAction = undefined;
      },
      error: (error: Error) => {
        this.setFeedback(error.message, 'error');
      }
    });
  }

  // 🔃 Filtros e paginação
  applyFilters() {
    const nextState = buildProductListState(this.products, {
      pageSize: this.pageSize,
      currentPage: this.currentPage,
      searchTerm: this.searchTerm,
      sortBy: this.sortBy,
    });

    this.processedProducts = nextState.processedProducts;
    this.filteredProducts = nextState.filteredProducts;
    this.totalPages = nextState.totalPages;
    this.currentPage = nextState.currentPage;
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  retryLoad() {
    this.service.load();
  }

  private setFeedback(message: string, type: 'success' | 'error') {
    this.feedbackMessage = message;
    this.feedbackType = type;
  }
}
