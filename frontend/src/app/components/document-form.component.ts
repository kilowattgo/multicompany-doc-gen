import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-xl mt-10 border">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Create Document</h2>
      
      <form [formGroup]="docForm" (ngSubmit)="onSubmit()">
        <!-- Header -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
             <label class="block text-sm text-gray-600 mb-1">Company</label>
             <select formControlName="companyId" class="border p-2 rounded w-full">
               <option value="">Select Company</option>
               <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
             </select>
          </div>
          <div>
             <label class="block text-sm text-gray-600 mb-1">Document Type</label>
             <select formControlName="type" class="border p-2 rounded w-full">
               <option value="QUOTATION">Quotation</option>
               <option value="INVOICE">Invoice</option>
               <option value="BILL">Bill</option>
               <option value="TAX_INVOICE">Tax Invoice</option>
             </select>
          </div>
        </div>

        <!-- Customer -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4 border">
          <div class="col-span-2"><h3 class="font-bold text-gray-700">Customer Details</h3></div>
          <input type="text" formControlName="customerName" placeholder="Customer Name" class="border p-2 rounded bg-white">
          <input type="text" formControlName="customerTaxId" placeholder="Customer Tax ID" class="border p-2 rounded bg-white">
          <textarea formControlName="customerAddress" placeholder="Customer Address" class="border p-2 rounded col-span-2 bg-white" rows="2"></textarea>
        </div>

        <!-- Items Array -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-gray-700">Items</h3>
            <button type="button" (click)="addItem()" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">+ Add Item</button>
          </div>
          
          <div formArrayName="items" class="space-y-2">
            <!-- Header Table -->
            <div class="flex gap-2 font-bold text-gray-600 text-sm px-2">
              <div class="flex-grow">Description</div>
              <div class="w-24 text-center">Qty</div>
              <div class="w-32 text-center">Price/Unit</div>
              <div class="w-32 text-right">Total</div>
              <div class="w-8"></div>
            </div>

            <!-- Rows -->
            <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="flex gap-2 items-center">
              <input formControlName="description" placeholder="Description" class="border p-2 rounded flex-grow">
              <input formControlName="quantity" type="number" (input)="calcTotals()" class="border p-2 rounded w-24 text-center">
              <input formControlName="pricePerUnit" type="number" (input)="calcTotals()" class="border p-2 rounded w-32 text-right">
              <div class="w-32 p-2 bg-gray-100 rounded text-right">{{ getItemTotal(i) | number:'1.2-2' }}</div>
              <button type="button" (click)="removeItem(i)" class="text-red-500 hover:text-red-700 font-bold px-2">X</button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="flex justify-end mb-6 text-right">
          <div class="w-72 border-t pt-4">
            <div class="flex justify-between py-1 text-gray-600"><span>Sub Total:</span> <span>{{ subTotal | number:'1.2-2' }}</span></div>
            <div class="flex justify-between py-1 text-gray-600"><span>VAT (7%):</span> <span>{{ vatAmount | number:'1.2-2' }}</span></div>
            <div class="flex justify-between mt-2 pt-2 text-xl font-bold text-blue-600 border-t">
              <span>Grand Total:</span> <span>{{ grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <button type="submit" [disabled]="docForm.invalid || items.length === 0" 
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400">
          Save Document & Generate PDF
        </button>
      </form>
    </div>
  `
})
export class DocumentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private docService = inject(DocumentService);

  companies: any[] = [];
  subTotal = 0; vatAmount = 0; grandTotal = 0;

  docForm: FormGroup = this.fb.group({
    companyId: ['', Validators.required],
    type: ['QUOTATION', Validators.required],
    customerName: ['', Validators.required],
    customerAddress: ['', Validators.required],
    customerTaxId: ['', Validators.required],
    items: this.fb.array([])
  });

  get items() { return this.docForm.get('items') as FormArray; }

  ngOnInit() {
    this.docService.getCompanies().subscribe(res => this.companies = res);
    this.addItem();
  }

  addItem() {
    this.items.push(this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      pricePerUnit: [0, [Validators.required, Validators.min(0)]]
    }));
    this.calcTotals();
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calcTotals();
  }

  getItemTotal(i: number) {
    const item = this.items.at(i).value;
    return (item.quantity || 0) * (item.pricePerUnit || 0);
  }

  calcTotals() {
    this.subTotal = this.items.controls.reduce((sum, ctrl) => sum + this.getItemTotal(this.items.controls.indexOf(ctrl)), 0);
    this.vatAmount = this.subTotal * 0.07;
    this.grandTotal = this.subTotal + this.vatAmount;
  }

  onSubmit() {
    if (this.docForm.valid) {
      this.docService.createDocument(this.docForm.value).subscribe({
        next: (res) => {
          this.docService.downloadPdf(res.id); // เปิด PDF อัตโนมัติหลังสร้างสำเร็จ
          this.docForm.reset({ type: 'QUOTATION' });
          this.items.clear();
          this.addItem();
          this.calcTotals();
        },
        error: (err) => console.error(err)
      });
    }
  }
}
