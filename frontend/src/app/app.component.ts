import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // Componente shell: somente projeta as rotas.
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}
