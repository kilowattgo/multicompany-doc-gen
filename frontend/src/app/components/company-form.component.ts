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
      <div class="p-6 glass-panel">
        <h2 class="text-xl font-bold gradient-text mb-4">{{ isEditing ? 'Edit Company' : 'Register New Company' }}</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          
          <div>
            <label class="block text-sm text-gray-400 mb-1">Company Name</label>
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

          <div>
            <label class="block text-sm text-gray-400 mb-1">Company Logo</label>
            <input type="file" (change)="onFileSelect($event, 'logo')" accept="image/*" class="w-full glass-input mb-2 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-cosmic-purple/20 file:text-cosmic-purple hover:file:bg-cosmic-purple/30">
            
            <!-- Logo Preview -->
            <div *ngIf="previewUrl || existingLogoUrl" class="mt-2 p-4 border border-white/10 rounded bg-black/20 flex flex-col items-center">
              <span class="text-xs text-gray-400 mb-2">Logo Preview (max-height: 150px)</span>
              <img [src]="previewUrl || getFullLogoUrl(existingLogoUrl)" 
                   alt="Logo Preview" 
                   style="max-height: 150px; max-width: 250px; object-fit: contain; border: 1px dashed #ccc;">
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1">Signature Image (Optional)</label>
            <input type="file" (change)="onFileSelect($event, 'signature')" accept="image/*" class="w-full glass-input mb-2 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-cosmic-purple/20 file:text-cosmic-purple hover:file:bg-cosmic-purple/30">
            
            <!-- Signature Preview -->
            <div *ngIf="signaturePreviewUrl || existingSignatureUrl" class="mt-2 p-4 border border-white/10 rounded bg-black/20 flex flex-col items-center">
              <span class="text-xs text-gray-400 mb-2">Signature Preview</span>
              <img [src]="signaturePreviewUrl || getFullLogoUrl(existingSignatureUrl)" 
                   alt="Signature Preview" 
                   style="max-height: 80px; max-width: 150px; object-fit: contain; border: 1px dashed #ccc;">
            </div>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" [disabled]="form.invalid" class="flex-1 gradient-btn disabled:opacity-40 disabled:cursor-not-allowed">
              {{ isEditing ? 'Update Company' : 'Save Company' }}
            </button>
            <button *ngIf="isEditing" type="button" (click)="resetForm()" class="px-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- List Section -->
      <div class="p-6 glass-panel">
        <h2 class="text-xl font-bold gradient-text mb-4">Existing Companies</h2>
        <div class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <div *ngFor="let c of companies" class="border border-white/10 p-4 rounded-lg hover:bg-white/5 flex justify-between items-center transition">
            <div class="flex items-center gap-4">
              <img *ngIf="c.logoUrl" [src]="getFullLogoUrl(c.logoUrl)" alt="logo" class="h-12 w-12 object-contain border border-white/20 rounded p-1 bg-black/20">
              <div *ngIf="!c.logoUrl" class="h-12 w-12 border border-white/10 rounded bg-black/20 flex items-center justify-center text-gray-500 text-xs">No Logo</div>
              
              <div *ngIf="c.signatureUrl" class="text-xs text-cosmic-purple font-bold ml-2">✍️ Has Signature</div>
              
              <div>
                <div class="font-bold text-cosmic-blue">{{ c.name }}</div>
                <div class="text-xs text-gray-400">Tax ID: {{ c.taxId }}</div>
              </div>
            </div>
            <button (click)="editCompany(c)" class="bg-white/10 text-cosmic-purple px-3 py-1 text-sm font-bold rounded-full hover:bg-white/20 transition-all">
              Edit
            </button>
          </div>
          
          <div *ngIf="companies.length === 0" class="text-center text-gray-500 py-8">
            No companies registered yet. ✨
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
  selectedSignatureFile: File | null = null;
  previewUrl: string | null = null;
  signaturePreviewUrl: string | null = null;
  existingLogoUrl: string | null = null;
  existingSignatureUrl: string | null = null;
  
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
    if (window.location.hostname === 'localhost' && window.location.port === '4201') {
      return `http://localhost:3001${path}`;
    }
    return path;
  }

  onFileSelect(event: any, type: 'logo' | 'signature') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      if (type === 'logo') {
        this.selectedFile = file;
        reader.onload = () => this.previewUrl = reader.result as string;
      } else {
        this.selectedSignatureFile = file;
        reader.onload = () => this.signaturePreviewUrl = reader.result as string;
      }
      reader.readAsDataURL(file);
    }
  }

  editCompany(company: any) {
    this.isEditing = true;
    this.editingId = company.id;
    
    this.existingLogoUrl = company.logoUrl;
    this.previewUrl = null;
    this.selectedFile = null;
    
    this.existingSignatureUrl = company.signatureUrl;
    this.signaturePreviewUrl = null;
    this.selectedSignatureFile = null;
    
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
    this.existingSignatureUrl = null;
    this.signaturePreviewUrl = null;
    this.selectedSignatureFile = null;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) return;
    const fd = new FormData();
    fd.append('name', this.form.value.name!);
    fd.append('address', this.form.value.address!);
    fd.append('taxId', this.form.value.taxId!);
    if (this.selectedFile) fd.append('logo', this.selectedFile);
    if (this.selectedSignatureFile) fd.append('signature', this.selectedSignatureFile);

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
