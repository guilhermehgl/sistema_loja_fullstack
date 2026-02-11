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

  constructor(
    private fb: FormBuilder,
    private service: ProductsService
  ) {
    // Formulário reativo com validações padrão + validação customizada de regra de negócio
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
            Validators.pattern(/^\d{8}$/), // Código de barras obrigatório com exatamente 8 dígitos
          ],
        ],
        quantity: [
          '',
          [
            Validators.min(0),
            Validators.max(999999),
            Validators.required,
            Validators.pattern(/^\d{1,6}$/), // Quantidade limitada a 6 dígitos
          ],
        ],
        price: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d+([.,]\d{1,2})?$/), // Permite decimal com ponto ou vírgula (até 2 casas)
          ],
        ],
      },
      {
        validators: this.nameRequiredIfBarcodeNotExists(), // Regra customizada aplicada ao formulário inteiro
      }
    );
  }

  /**
   * Validação customizada:
   * Se o código de barras NÃO existir no sistema, então o nome passa a ser obrigatório.
   * Isso permite reaproveitar cadastro automático por barcode.
   */
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

  /**
   * Permite somente números em inputs específicos e limita o tamanho máximo.
   * Usado para garantir que o usuário não digite caracteres inválidos.
   */
  onlyNumbers(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;

    input.value = input.value
      .replace(/\D/g, '')
      .slice(0, maxLength);

    this.form.get(input.getAttribute('formControlName')!)?.setValue(input.value);
  }

  /**
   * Máscara para preço permitindo apenas números e separador decimal (vírgula ou ponto).
   * Evita que o usuário insira caracteres inválidos.
   */
  priceMask(event: Event) {
    const input = event.target as HTMLInputElement;

    input.value = input.value
      .replace(/[^0-9.,]/g, '')     // remove tudo que não for número, ponto ou vírgula
      .replace(/(,.*),/g, '$1')     // impede múltiplas vírgulas
      .replace(/(\..*)\./g, '$1');  // impede múltiplos pontos

    this.form.get('price')?.setValue(input.value);
  }

  /**
   * Normaliza o valor do preço antes de salvar:
   * - troca vírgula por ponto
   * - valida parseFloat
   * - fixa em 2 casas decimais
   */
  normalizePrice() {
    let value = this.form.get('price')?.value;

    if (!value) return;

    value = value.replace(',', '.');

    const number = parseFloat(value);

    if (isNaN(number)) {
      this.form.get('price')?.setErrors({ invalid: true });
      return;
    }

    this.form.get('price')?.setValue(number.toFixed(2));
  }

  /**
   * Máscara para quantidade:
   * - apenas números
   * - máximo de 6 dígitos
   * - converte para Number no FormControl
   */
  quantityMask(event: Event) {
    const input = event.target as HTMLInputElement;

    const value = input.value.replace(/\D/g, '').slice(0, 6);

    input.value = value;

    this.form.get('quantity')?.setValue(
      value === '' ? null : Number(value),
      { emitEvent: false } // evita disparar eventos de mudança desnecessários
    );
  }

  /**
   * Envia o formulário para o backend após validação.
   * Normaliza o preço para formato numérico antes de enviar.
   */
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;

    const payload = {
      ...raw,
      price: Number(raw.price.replace(',', '.')), // converte para número no formato aceito pelo backend
    };

    this.service.create(payload).subscribe({
      next: () => {
        // Reset completo do formulário após salvar
        this.form.reset({
          name: '',
          barcode: '',
          quantity: '',
          price: '',
        });
      },
      error: (err) => {
        console.error('Erro ao salvar produto:', err);
        alert('Erro ao salvar produto (ver console/backend)');
      }
    });
  }

  // Getter para facilitar acesso aos controles no HTML
  get f(): ProductFormControls {
    return this.form.controls as ProductFormControls;
  }

  /**
   * Retorna se um controle específico possui determinado erro,
   * considerando se ele já foi tocado.
   */
  hasError(controlName: keyof ProductFormControls, error: string): boolean {
    const control = this.f[controlName];
    return !!(control.touched && control.errors && control.errors[error]);
  }

  /**
   * Retorna se o formulário possui determinado erro global (validação customizada).
   */
  formHasError(error: string): boolean {
    return !!(this.form.touched && this.form.errors && this.form.errors[error]);
  }
}
