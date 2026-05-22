import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Form Section -->
      <div class="p-6 bg-white rounded-xl shadow-md border">
        <h2 class="text-xl font-bold text-gray-800 mb-4">{{ isEditing ? 'Edit Company' : 'Register New Company' }}</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">Company Name</label>
            <input type="text" formControlName="name" class="w-full border p-2 rounded">
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">Address</label>
            <textarea formControlName="address" class="w-full border p-2 rounded" rows="3"></textarea>
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">Tax ID</label>
            <input type="text" formControlName="taxId" class="w-full border p-2 rounded">
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">Company Logo</label>
            <input type="file" (change)="onFileSelect($event)" accept="image/*" class="w-full border p-2 rounded mb-2">
            
            <!-- Logo Preview -->
            <div *ngIf="previewUrl || existingLogoUrl" class="mt-2 p-4 border rounded bg-gray-50 flex flex-col items-center">
              <span class="text-xs text-gray-500 mb-2">Logo Preview (max-height: 150px)</span>
              <img [src]="previewUrl || getFullLogoUrl(existingLogoUrl)" 
                   alt="Logo Preview" 
                   style="max-height: 150px; max-width: 250px; object-fit: contain; border: 1px dashed #ccc;">
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" [disabled]="form.invalid" class="flex-1 bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
              {{ isEditing ? 'Update Company' : 'Save Company' }}
            </button>
            <button *ngIf="isEditing" type="button" (click)="resetForm()" class="px-4 bg-gray-500 text-white rounded font-bold hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- List Section -->
      <div class="p-6 bg-white rounded-xl shadow-md border">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Existing Companies</h2>
        <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <div *ngFor="let c of companies" class="border p-4 rounded hover:bg-gray-50 flex justify-between items-center transition">
            <div class="flex items-center gap-4">
              <img *ngIf="c.logoUrl" [src]="getFullLogoUrl(c.logoUrl)" alt="logo" class="h-12 w-12 object-contain border rounded p-1 bg-white">
              <div *ngIf="!c.logoUrl" class="h-12 w-12 border rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Logo</div>
              
              <div>
                <div class="font-bold text-blue-700">{{ c.name }}</div>
                <div class="text-xs text-gray-500">Tax ID: {{ c.taxId }}</div>
              </div>
            </div>
            <button (click)="editCompany(c)" class="bg-yellow-100 text-yellow-700 px-3 py-1 text-sm font-bold rounded hover:bg-yellow-200">
              Edit
            </button>
          </div>
          
          <div *ngIf="companies.length === 0" class="text-center text-gray-500 py-8">
            No companies registered yet.
          </div>
        </div>
      </div>
    </div>
  `
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private docService = inject(DocumentService);
  
  form = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    taxId: ['', Validators.required],
  });
  
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  existingLogoUrl: string | null = null;
  
  companies: any[] = [];
  isEditing = false;
  editingId: number | null = null;

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.docService.getCompanies().subscribe({
      next: (res) => this.companies = res,
      error: (err) => console.error(err)
    });
  }

  getFullLogoUrl(path: string | null): string {
    if (!path) return '';
    return `http://localhost:3001${path}`;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  editCompany(company: any) {
    this.isEditing = true;
    this.editingId = company.id;
    this.existingLogoUrl = company.logoUrl;
    this.previewUrl = null;
    this.selectedFile = null;
    
    this.form.patchValue({
      name: company.name,
      address: company.address,
      taxId: company.taxId
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.isEditing = false;
    this.editingId = null;
    this.existingLogoUrl = null;
    this.previewUrl = null;
    this.selectedFile = null;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) return;
    const fd = new FormData();
    fd.append('name', this.form.value.name!);
    fd.append('address', this.form.value.address!);
    fd.append('taxId', this.form.value.taxId!);
    if (this.selectedFile) fd.append('logo', this.selectedFile);

    if (this.isEditing && this.editingId) {
      this.docService.updateCompany(this.editingId, fd).subscribe({
        next: () => {
          alert('Company updated successfully!');
          this.resetForm();
          this.loadCompanies();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.docService.createCompany(fd).subscribe({
        next: () => {
          alert('Company created successfully!');
          this.resetForm();
          this.loadCompanies();
        },
        error: (err) => console.error(err)
      });
    }
  }
}
