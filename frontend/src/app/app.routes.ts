import { Routes } from '@angular/router';
import { ProductsPage } from './pages/products/products.page';

export const routes: Routes = [
  {
    // Rota principal da aplicacao.
    path: '',
    component: ProductsPage,
  },
];
