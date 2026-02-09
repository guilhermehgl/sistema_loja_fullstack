import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Product } from '../../../../core/services/products.service';
import { BaseModalComponent } from '../base-modal/base-modal.component';

@Component({
    selector: 'app-edit-product-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, BaseModalComponent],
    templateUrl: './edit-modal.component.html',
    styleUrls: ['../../../../../../src/styles/modal.global.scss']
})
export class EditProductModalComponent implements OnInit {
    @Input() product!: Product;
    @Input() existingBarcodes: string[] = [];
    @Output() save = new EventEmitter<Product>();
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;

    constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.form = this.fb.group({
            name: [this.product.name || '', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
            barcode: [
                this.product.barcode || '',
                [
                    Validators.required,
                    Validators.pattern(/^\d{8}$/),
                    this.barcodeExistsValidator.bind(this)
                ]
            ],
            quantity: [
                this.product.quantity?.toString() || '',
                [Validators.required, Validators.pattern(/^\d{1,6}$/)]
            ],
            price: [
                this.product.price?.toString() || '',
                [Validators.required, Validators.pattern(/^(\d+)([.,]\d{1,2})?$/)]
            ]
        });

        setTimeout(() => this.cdr.detectChanges());
    }

    barcodeExistsValidator(control: AbstractControl) {
        const value = control.value;
        if (!value) return null;
    
        const exists = this.existingBarcodes.includes(value) && value !== this.product.barcode;

        return exists ? { barcodeExists: true } : null;
    }


    onNumberInput(event: KeyboardEvent) {
        const allowed = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (!/[0-9]/.test(event.key) && !allowed.includes(event.key)) {
            event.preventDefault();
        }
    }

    onPriceInput(event: KeyboardEvent) {
        const allowed = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (!/[0-9.,]/.test(event.key) && !allowed.includes(event.key)) {
            event.preventDefault();
        }
    }

    handleSave() {
        if (this.form.invalid) return;

        const formValue = this.form.value;
        const updated: Product = {
            ...this.product,
            name: formValue.name,
            barcode: formValue.barcode,
            quantity: Number(formValue.quantity),
            price: Number(formValue.price.toString().replace(',', '.'))
        };

        this.save.emit(updated);
    }

    handleCancel() {
        this.cancel.emit();
    }

    get name() { return this.form.get('name'); }
    get barcode() { return this.form.get('barcode'); }
    get quantity() { return this.form.get('quantity'); }
    get price() { return this.form.get('price'); }
}
