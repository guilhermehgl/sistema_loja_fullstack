import { Product } from '../../../../core/services/products.service';

export type ProductSortBy = 'barcode' | 'name';

export interface ProductListQuery {
  pageSize: number;
  currentPage: number;
  searchTerm: string;
  sortBy: ProductSortBy;
}

export interface ProductListState {
  processedProducts: Product[];
  filteredProducts: Product[];
  totalPages: number;
  currentPage: number;
}

export function buildProductListState(products: Product[], query: ProductListQuery): ProductListState {
  const pageSize = Number(query.pageSize);
  let result = [...products];

  if (query.searchTerm) {
    const term = query.searchTerm.toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.barcode.toString().includes(term),
    );
  }

  result.sort((a, b) =>
    query.sortBy === 'barcode'
      ? Number(a.barcode) - Number(b.barcode)
      : a.name.localeCompare(b.name),
  );

  const totalPages = Math.max(1, Math.ceil(result.length / pageSize));
  const currentPage = query.currentPage > totalPages ? 1 : query.currentPage;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    processedProducts: result,
    filteredProducts: result.slice(startIndex, endIndex),
    totalPages,
    currentPage,
  };
}
