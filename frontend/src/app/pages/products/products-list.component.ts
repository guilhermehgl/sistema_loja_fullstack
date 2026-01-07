import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../core/services/products.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  processedProducts: Product[] = [];

  // 🔍 busca
  searchTerm: string = '';

  // 🔢 quantidade por página
  pageSize: number = 1;

  // 🔃 ordenação
  sortBy: 'barcode' | 'name' = 'barcode';

  // 📄 paginação
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private service: ProductsService,
    private cdr: ChangeDetectorRef
  ) { }



  ngOnInit() {
    this.service.products$.subscribe(data => {
      this.products = data;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  updatePagedProducts() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.filteredProducts = this.processedProducts.slice(startIndex, endIndex);
  }

applyFilters() {
  const pageSize = Number(this.pageSize);

  let result = [...this.products];

  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    result = result.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.barcode.toString().includes(term)
    );
  }

  if (this.sortBy === 'barcode') {
    result.sort((a, b) => Number(a.barcode) - Number(b.barcode));
  } else {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  this.processedProducts = result;

  this.totalPages = Math.max(
    1,
    Math.ceil(this.processedProducts.length / pageSize)
  );

  if (this.currentPage > this.totalPages) {
    this.currentPage = 1;
  }

  const startIndex = (this.currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  this.filteredProducts = this.processedProducts.slice(startIndex, endIndex);
}


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedProducts();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedProducts();
    }
  }
}
