import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductsService } from '../../../../core/services/products.service';
import { formatPriceInput, toNumericPrice } from './products-form.util';

type ProductFormControls = {
  name: AbstractControl;
  barcode: AbstractControl;
  quantity: AbstractControl;
  price: AbstractControl;
};

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products-form.component.html',
})

export class ProductsFormComponent {
  form: FormGroup;
  isSubmitting = false;
  submitError = '';
  submitSuccess = '';

  constructor(
    private fb: FormBuilder,
    private service: ProductsService
  ) {
    this.form = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(30),
          ],
        ],
        barcode: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d{8}$/),
          ],
        ],
        quantity: [
          '',
          [
            Validators.min(0),
            Validators.max(999999),
            Validators.required,
            Validators.pattern(/^\d{1,6}$/),
          ],
        ],
        price: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d{1,7}(,\d{2})?$/),
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

      const exists = this.service.existsByBarcode(barcode);

      if (!exists && (!name || name.trim().length === 0)) {
        return { nameRequired: true };
      }

      return null;
    };
  }

  onlyNumbers(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;

    input.value = input.value
      .replace(/\D/g, '')       
      .slice(0, maxLength);    

    this.form.get(input.getAttribute('formControlName')!)?.setValue(input.value);
  }


  priceMask(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = formatPriceInput(input.value);

    input.value = formatted;
    this.form.get('price')?.setValue(formatted);
  }

  normalizePrice() {
    const value = this.form.get('price')?.value as string | null;
    if (!value) return;
    this.form.get('price')?.setValue(formatPriceInput(value));
  }


  quantityMask(event: Event) {
    const input = event.target as HTMLInputElement;

    const value = input.value.replace(/\D/g, '').slice(0, 6);

    input.value = value;

    this.form.get('quantity')?.setValue(
      value === '' ? null : Number(value),
      { emitEvent: false }
    );
  }



  save() {
    this.submitError = '';
    this.submitSuccess = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const raw = this.form.value;

    const payload = {
      ...raw,
      quantity: Number(raw.quantity),
      price: toNumericPrice(raw.price),
    };

    this.service.create(payload).subscribe({
      next: () => {
        this.form.reset({
          name: '',
          barcode: '',
          quantity: '',
          price: '',
        });
        this.submitSuccess = 'Produto salvo com sucesso.';
      },
      error: (err: Error) => {
        this.submitError = err.message;
      }
    }).add(() => {
      this.isSubmitting = false;
    });
  }


  // ✅ TIPAGEM PROFISSIONAL PRO TEMPLATE
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
