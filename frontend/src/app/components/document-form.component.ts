import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../services/document.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto card-panel mt-10">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">{{ isEditing ? 'Edit Document' : 'Create Document' }}</h2>
            <form [formGroup]="docForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Company & Type Selection -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">Select Issuing Company</label>
              <select formControlName="companyId" class="w-full clean-input">
                <option value="">-- Select Company --</option>
                <option *ngFor="let c of companies" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">Document Type</label>
              <select formControlName="type" class="w-full clean-input">
                <option value="QUOTATION">ใบเสนอราคา (Quotation)</option>
                <option value="INVOICE">ใบแจ้งหนี้ (Invoice)</option>
                <option value="BILL">ใบเสร็จรับเงิน (Bill)</option>
                <option value="TAX_INVOICE">ใบกำกับภาษี (Tax Invoice)</option>
              </select>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm text-gray-500 mb-1">Document Number</label>
            <input type="text" formControlName="docNumber" placeholder="Leave blank to auto-generate" class="w-full clean-input">
          </div>
          
          <div class="flex items-center gap-6 mb-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" formControlName="includeSignature" class="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800">
              <span class="text-sm font-bold text-gray-600">✍️ Include Company Signature in PDF</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" formControlName="includeVat" (change)="calcTotals()" class="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800">
              <span class="text-sm font-bold text-gray-600">💰 Include VAT (7%)</span>
            </label>
          </div>

          <hr class="my-4 border-gray-200">

          <!-- Customer Details -->
          <div>
            <h3 class="font-bold text-gray-800 mb-2">Customer Details</h3>
            
            <div class="mb-4">
              <label class="block text-sm font-bold text-blue-600 mb-1">Auto-Fill from Saved Customers (Optional)</label>
              <select (change)="onCustomerSelect($event)" class="w-full clean-input border-blue-200">
                <option value="">-- Select a Saved Customer --</option>
                <option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-500 mb-1">Customer Name</label>
                <input type="text" formControlName="customerName" class="w-full clean-input">
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Tax ID</label>
                <input type="text" formControlName="customerTaxId" class="w-full clean-input">
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm text-gray-500 mb-1">Customer Address</label>
              <textarea formControlName="customerAddress" class="w-full clean-input" rows="2"></textarea>
            </div>
          </div>

        <!-- Items Array -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-gray-700">Items</h3>
            <button type="button" (click)="addItem()" class="bg-gray-100 text-gray-700 px-4 py-1 rounded font-bold hover:bg-gray-200 transition-all">+ Add Item</button>
          </div>
          
          <div formArrayName="items" class="space-y-2">
            <!-- Header Table -->
            <div class="flex gap-2 font-bold text-gray-500 text-sm px-2">
              <div class="flex-grow">Description</div>
              <div class="w-24 text-center">Qty</div>
              <div class="w-32 text-center">Price/Unit</div>
              <div class="w-32 text-right">Total</div>
              <div class="w-8"></div>
            </div>

            <!-- Rows -->
            <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="flex gap-2 items-center">
              <input formControlName="description" placeholder="Description" class="clean-input flex-grow">
              <input formControlName="quantity" type="number" (input)="calcTotals()" class="clean-input w-24 text-center">
              <input formControlName="pricePerUnit" type="number" (input)="calcTotals()" class="clean-input w-32 text-right">
              <div class="w-32 p-2 bg-gray-50 rounded text-right text-gray-700">{{ getItemTotal(i) | number:'1.2-2' }}</div>
              <button type="button" (click)="removeItem(i)" class="text-red-500 hover:text-red-700 font-bold px-2">X</button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="flex justify-end mb-6 text-right">
          <div class="w-72 border-t border-gray-200 pt-4">
            <div class="flex justify-between py-1 text-gray-500"><span>Sub Total:</span> <span>{{ subTotal | number:'1.2-2' }}</span></div>
            <div class="flex justify-between py-1 text-gray-500"><span>VAT (7%):</span> <span>{{ vatAmount | number:'1.2-2' }}</span></div>
            <div class="flex justify-between mt-2 pt-2 text-xl font-bold text-gray-900 border-t border-gray-200">
              <span>Grand Total:</span> <span>{{ grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <button type="submit" [disabled]="docForm.invalid || items.length === 0" 
                class="w-full accent-btn py-3 text-lg disabled:opacity-40 disabled:cursor-not-allowed">
          {{ isEditing ? 'Update Document & Generate PDF' : 'Save Document & Generate PDF' }}
        </button>
      </form>
    </div>
  `
})
export class DocumentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private docService = inject(DocumentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  companies: any[] = [];
  customers: any[] = [];
  subTotal = 0; vatAmount = 0; grandTotal = 0;
  isEditing = false;
  editingId: number | null = null;

  docForm: FormGroup = this.fb.group({
    companyId: ['', Validators.required],
    type: ['QUOTATION', Validators.required],
    docNumber: [''],
    customerName: ['', Validators.required],
    customerAddress: ['', Validators.required],
    customerTaxId: ['', Validators.required],
    includeSignature: [false],
    includeVat: [true],
    items: this.fb.array([])
  });

  get items() { return this.docForm.get('items') as FormArray; }

  ngOnInit() {
    this.docService.getCompanies().subscribe(res => this.companies = res);
    this.docService.getCustomers().subscribe(res => this.customers = res);
    
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.editingId = parseInt(params['id']);
        this.loadDocumentData(this.editingId);
      } else {
        this.addItem();
      }
    });
  }

  loadDocumentData(id: number) {
    this.docService.getDocumentById(id).subscribe({
      next: (doc) => {
        this.docForm.patchValue({
          companyId: doc.companyId,
          type: doc.type,
          docNumber: doc.docNumber,
          customerName: doc.customerName,
          customerAddress: doc.customerAddress,
          customerTaxId: doc.customerTaxId,
          includeSignature: doc.includeSignature,
          includeVat: doc.vatRate > 0
        });
        
        this.items.clear();
        doc.items.forEach((item: any) => {
          this.items.push(this.fb.group({
            description: [item.description, Validators.required],
            quantity: [item.quantity, [Validators.required, Validators.min(1)]],
            pricePerUnit: [item.pricePerUnit, [Validators.required, Validators.min(0)]]
          }));
        });
        this.calcTotals();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to load document data');
        this.router.navigate(['/history']);
      }
    });
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
    const hasVat = this.docForm.get('includeVat')?.value;
    this.vatAmount = hasVat ? this.subTotal * 0.07 : 0;
    this.grandTotal = this.subTotal + this.vatAmount;
  }

  onSubmit() {
    if (this.docForm.valid) {
      if (this.isEditing && this.editingId) {
        this.docService.updateDocument(this.editingId, this.docForm.value).subscribe({
          next: (res) => {
            this.docService.downloadPdf(res.id);
            this.router.navigate(['/history']);
          },
          error: (err) => {
            console.error(err);
            if (err.status === 400 && err.error?.message) {
              alert(err.error.message);
            } else {
              alert('Failed to update document');
            }
          }
        });
      } else {
        this.docService.createDocument(this.docForm.value).subscribe({
          next: (res) => {
            this.docService.downloadPdf(res.id);
            this.docForm.reset({ type: 'QUOTATION', includeSignature: false, includeVat: true, docNumber: '' });
            this.items.clear();
            this.addItem();
            this.calcTotals();
          },
          error: (err) => {
            console.error(err);
            if (err.status === 400 && err.error?.message) {
              alert(err.error.message);
            } else {
              alert('Failed to create document');
            }
          }
        });
      }
    }
  }
}
