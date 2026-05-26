import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Form Section -->
      <div class="p-6 glass-panel">
        <h2 class="text-xl font-bold gradient-text mb-4">{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          
          <div>
            <label class="block text-sm text-gray-400 mb-1">Customer Name</label>
            <input type="text" formControlName="name" class="w-full glass-input">
          </div>
          
          <div>
            <label class="block text-sm text-gray-400 mb-1">Address</label>
            <textarea formControlName="address" class="w-full glass-input" rows="3"></textarea>
          </div>
          
          <div>
            <label class="block text-sm text-gray-400 mb-1">Tax ID</label>
            <input type="text" formControlName="taxId" class="w-full glass-input">
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" [disabled]="form.invalid" class="flex-1 gradient-btn disabled:opacity-40 disabled:cursor-not-allowed">
              {{ isEditing ? 'Update Customer' : 'Save Customer' }}
            </button>
            <button *ngIf="isEditing" type="button" (click)="resetForm()" class="px-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- List Section -->
      <div class="p-6 glass-panel">
        <h2 class="text-xl font-bold gradient-text mb-4">Customer List</h2>
        <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <div *ngFor="let c of customers" class="border border-white/10 p-4 rounded-lg hover:bg-white/5 flex justify-between items-center transition">
            <div>
              <div class="font-bold text-cosmic-blue">{{ c.name }}</div>
              <div class="text-xs text-gray-400">Tax ID: {{ c.taxId }}</div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">{{ c.address }}</div>
            </div>
            <button (click)="editCustomer(c)" class="bg-white/10 text-cosmic-purple px-3 py-1 text-sm font-bold rounded-full hover:bg-white/20 transition-all">
              Edit
            </button>
          </div>
          
          <div *ngIf="customers.length === 0" class="text-center text-gray-500 py-8">
            No customers registered yet.
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private docService = inject(DocumentService);
  
  form = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    taxId: ['', Validators.required],
  });
  
  customers: any[] = [];
  isEditing = false;
  editingId: number | null = null;

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.docService.getCustomers().subscribe({
      next: (res) => this.customers = res,
      error: (err) => console.error(err)
    });
  }

  editCustomer(customer: any) {
    this.isEditing = true;
    this.editingId = customer.id;
    
    this.form.patchValue({
      name: customer.name,
      address: customer.address,
      taxId: customer.taxId
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.isEditing = false;
    this.editingId = null;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isEditing && this.editingId) {
      this.docService.updateCustomer(this.editingId, this.form.value).subscribe({
        next: () => {
          alert('Customer updated successfully!');
          this.resetForm();
          this.loadCustomers();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.docService.createCustomer(this.form.value).subscribe({
        next: () => {
          alert('Customer created successfully!');
          this.resetForm();
          this.loadCustomers();
        },
        error: (err) => console.error(err)
      });
    }
  }
}
