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
            <form [formGroup]="docForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Company & Type Selection -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Select Issuing Company</label>
              <select formControlName="companyId" class="w-full border p-2 rounded bg-white">
                <option value="">-- Select Company --</option>
                <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Document Type</label>
              <select formControlName="type" class="w-full border p-2 rounded bg-white">
                <option value="QUOTATION">Quotation (ใบเสนอราคา)</option>
                <option value="INVOICE">Invoice (ใบแจ้งหนี้)</option>
                <option value="BILL">Bill (ใบเสร็จรับเงิน)</option>
                <option value="TAX_INVOICE">Tax Invoice (ใบกำกับภาษี)</option>
              </select>
            </div>
          </div>

          <hr class="my-4">

          <!-- Customer Details -->
          <div>
            <h3 class="font-bold text-gray-800 mb-2">Customer Details</h3>
            
            <div class="mb-4">
              <label class="block text-sm font-bold text-blue-600 mb-1">Auto-Fill from Saved Customers (Optional)</label>
              <select (change)="onCustomerSelect($event)" class="w-full border-2 border-blue-200 bg-blue-50 p-2 rounded">
                <option value="">-- Select a Saved Customer --</option>
                <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Customer Name</label>
                <input type="text" formControlName="customerName" class="w-full border p-2 rounded">
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Tax ID</label>
                <input type="text" formControlName="customerTaxId" class="w-full border p-2 rounded">
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm text-gray-600 mb-1">Customer Address</label>
              <textarea formControlName="customerAddress" class="w-full border p-2 rounded" rows="2"></textarea>
            </div>
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
  customers: any[] = [];
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
    this.docService.getCustomers().subscribe(res => this.customers = res);
    this.addItem();
  }

  onCustomerSelect(event: any) {
    const customerId = parseInt(event.target.value);
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      this.docForm.patchValue({
        customerName: customer.name,
        customerAddress: customer.address,
        customerTaxId: customer.taxId
      });
    }
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
