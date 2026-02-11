import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ProductsService } from '../../../../core/services/products.service';
import { AlertModalComponent } from '../../../../shared/components/modal/alert-modal/alert-modal.component';

type ProductFormControls = {
  name: AbstractControl;
  barcode: AbstractControl;
  quantity: AbstractControl;
  price: AbstractControl;
};

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertModalComponent],
  templateUrl: './products-form.component.html',
})
export class ProductsFormComponent {
  form: FormGroup;
  showAlertModal = false;
  alertMessage = '';

  constructor(
    private fb: FormBuilder,
    private service: ProductsService
  ) {
    // Produto novo exige nome; para barcode existente, o nome pode ser omitido.
    this.form = this.fb.group(
      {
        name: [
          '',
          [
            Validators.minLength(4),
            Validators.maxLength(30),
          ],
        ],
        barcode: [
          '',
          [
            Validators.required,
            // Barcode interno com 8 digitos numericos fixos.
            Validators.pattern(/^\d{8}$/),
          ],
        ],
        quantity: [
          '',
          [
            Validators.min(0),
            Validators.max(999999),
            Validators.required,
            // Mantem validacao alinhada com a mascara de entrada (1 a 6 digitos).
            Validators.pattern(/^\d{1,6}$/),
          ],
        ],
        price: [
          '',
          [
            Validators.required,
            // Aceita virgula ou ponto como separador decimal, com ate 2 casas.
            Validators.pattern(/^\d+([.,]\d{1,2})?$/),
          ],
        ],
      },
      {
        validators: this.nameRequiredIfBarcodeNotExists(),
      }
    );
  }

  nameRequiredIfBarcodeNotExists() {
    return (group: AbstractControl): ValidationErrors | null => {
      const barcode = group.get('barcode')?.value;
      const name = group.get('name')?.value;

      // Valida em memoria para evitar chamada de API durante digitacao.
      const exists = this.service.existsByBarcode(barcode);

      if (!exists && (!name || name.trim().length === 0)) {
        return { nameRequired: true };
      }

      return null;
    };
  }

  onlyNumbers(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;

    // Normaliza no input para manter UI e FormControl sincronizados.
    input.value = input.value
      .replace(/\D/g, '')
      .slice(0, maxLength);

    this.form.get(input.getAttribute('formControlName')!)?.setValue(input.value);
  }

  priceMask(event: Event) {
    const input = event.target as HTMLInputElement;

    // Permite apenas um separador decimal (virgula ou ponto).
    input.value = input.value
      .replace(/[^0-9.,]/g, '')
      .replace(/(,.*),/g, '$1')
      .replace(/(\..*)\./g, '$1');

    this.form.get('price')?.setValue(input.value);
  }

  normalizePrice() {
    let value = this.form.get('price')?.value;

    if (!value) return;

    // Padroniza para decimal JS antes de validar e formatar.
    value = value.replace(',', '.');

    const number = parseFloat(value);

    if (isNaN(number)) {
      this.form.get('price')?.setErrors({ invalid: true });
      return;
    }

    this.form.get('price')?.setValue(number.toFixed(2));
  }

  quantityMask(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 6);

    input.value = value;

    // Evita reprocessar mascara ao atualizar o controle por codigo.
    this.form.get('quantity')?.setValue(
      value === '' ? null : Number(value),
      { emitEvent: false }
    );
  }

  save() {
    if (this.form.invalid) {
      // Exibe feedback imediato para todos os campos invalidos no submit.
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const payload = {
      ...raw,
      // Backend espera numero; converte entrada local para decimal JS.
      price: Number(raw.price.replace(',', '.')),
    };

    this.service.create(payload).subscribe({
      next: () => {
        // Mantem reset explicito para evitar depender de defaults implicitos.
        this.form.reset({
          name: '',
          barcode: '',
          quantity: '',
          price: '',
        });
      },
      error: (err) => {
        // Console para diagnostico tecnico; modal para mensagem amigavel.
        console.error('Erro ao salvar produto:', err);
        this.alertMessage = 'Erro ao salvar produto. Verifique os dados e tente novamente.';
        this.showAlertModal = true;
      }
    });
  }

  get f(): ProductFormControls {
    return this.form.controls as ProductFormControls;
  }

  hasError(controlName: keyof ProductFormControls, error: string): boolean {
    const control = this.f[controlName];
    return !!(control.touched && control.errors && control.errors[error]);
  }

  formHasError(error: string): boolean {
    return !!(this.form.touched && this.form.errors && this.form.errors[error]);
  }
}
